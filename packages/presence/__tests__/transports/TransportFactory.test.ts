import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/transports/IPCDiscovery', () => ({
    IPCDiscovery: {
        findTransport: vi.fn(),
    },
}));
vi.mock('../../src/transports/WebSocketTransport', () => ({
    WebSocketTransport: vi.fn(() => ({
        connect: vi.fn(() => Promise.resolve())
    })),
}));

const { TransportFactory } = await import('../../src/transports/TransportFactory');
const { IPCDiscovery } = await import('../../src/transports/IPCDiscovery');
const { WebSocketTransport } = await import('../../src/transports/WebSocketTransport');

describe('TransportFactory', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should return IPC transport if discovery succeeds', async () => {
        const mockIPC = { connect: vi.fn() };
        (IPCDiscovery.findTransport as any).mockResolvedValue(mockIPC);

        const transport = await TransportFactory.createDefault();
        
        expect(transport).toBe(mockIPC);
        expect(IPCDiscovery.findTransport).toHaveBeenCalled();
        expect(WebSocketTransport).not.toHaveBeenCalled();
    });

    it('should fallback to WebSocket if IPC discovery fails', async () => {
        (IPCDiscovery.findTransport as any).mockRejectedValue(new Error('IPC failed'));
        
        const mockWS = { connect: vi.fn().mockResolvedValue(undefined) };
        (WebSocketTransport as any).mockImplementation(function() {
            return mockWS;
        });

        const transport = await TransportFactory.createDefault();
        
        expect(transport).toBe(mockWS);
        expect(IPCDiscovery.findTransport).toHaveBeenCalled();
        expect(WebSocketTransport).toHaveBeenCalled();
    });

    it('should throw error if all transports fail', async () => {
        (IPCDiscovery.findTransport as any).mockRejectedValue(new Error('IPC failed'));
        (WebSocketTransport as any).mockImplementation(function() {
            return {
                connect: vi.fn().mockRejectedValue(new Error('WS failed'))
            };
        });

        await expect(TransportFactory.createDefault()).rejects.toThrow('Could not find a running Discord instance via IPC or WebSocket.');
    });
});
