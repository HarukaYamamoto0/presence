import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/transports/NodeIPCTransport', () => ({
    NodeIPCTransport: vi.fn(() => ({
        connect: vi.fn(() => Promise.resolve())
    })),
}));
vi.mock('../../src/transports/IPCResolver', () => ({
    UnixIPCResolver: vi.fn(),
    getPlatformResolver: vi.fn(),
}));
vi.mock('../../src/transports/WebSocketTransport', () => ({
    WebSocketTransport: vi.fn(),
}));

const { IPCDiscovery } = await import('../../src/transports/IPCDiscovery');
const { NodeIPCTransport } = await import('../../src/transports/NodeIPCTransport');
const { getPlatformResolver } = await import('../../src/transports/IPCResolver');

describe('IPCDiscovery', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        const mockResolver = {
            getEndpoints: vi.fn().mockReturnValue(['/tmp/discord-ipc-0'])
        };
        (getPlatformResolver as any).mockReturnValue(mockResolver);
    });

    it('should find and connect to a transport', async () => {
        const mockTransport = {
            connect: vi.fn().mockResolvedValue(undefined)
        };
        (NodeIPCTransport as any).mockImplementation(function() {
            return mockTransport;
        });

        const transport = await IPCDiscovery.findTransport();
        
        expect(transport).toBe(mockTransport);
        expect(mockTransport.connect).toHaveBeenCalled();
    });

    it('should try multiple paths if some fail', async () => {
        const mockTransportFail = {
            connect: vi.fn().mockRejectedValue(new Error('Fail'))
        };
        const mockTransportSuccess = {
            connect: vi.fn().mockResolvedValue(undefined)
        };

        (NodeIPCTransport as any).mockClear();
        (NodeIPCTransport as any)
            .mockImplementationOnce(function() { return mockTransportFail; })
            .mockImplementationOnce(function() { return mockTransportSuccess; });

        const transport = await IPCDiscovery.findTransport();
        
        expect(transport).toBe(mockTransportSuccess);
        expect(NodeIPCTransport).toHaveBeenCalledTimes(2);
    });

    it('should throw if no instance is found after all attempts', async () => {
        (getPlatformResolver as any).mockReturnValue({
            getEndpoints: vi.fn().mockReturnValue([])
        });

        await expect(IPCDiscovery.findTransport()).rejects.toThrow('Could not find a running Discord instance via IPC.');
    });
});
