import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('ws', () => ({
    WebSocket: vi.fn(() => ({
        on: vi.fn(),
        once: vi.fn(),
        send: vi.fn(),
        close: vi.fn(),
        terminate: vi.fn(),
    })),
}));

// Mock modules that might leak from other tests in Bun
vi.mock('../../src/transports/IPCDiscovery', () => ({
    IPCDiscovery: { findTransport: vi.fn() }
}));

const { WebSocketTransport } = await import('../../src/transports/WebSocketTransport');
const { WebSocket } = await import('ws');

describe('WebSocketTransport', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should connect to correct URL', async () => {
        const transport = new WebSocketTransport(6463);
        
        // Mock WebSocket behaexpector
        const mockWsInstance = {
            on: vi.fn((event, cb) => {
                if (event === 'open') {
                    // Simulate open event
                    setTimeout(cb, 0);
                }
            }),
            binaryType: '',
            send: vi.fn(),
            close: vi.fn()
        };
        (WebSocket as any).mockImplementation(function() {
            return mockWsInstance;
        });

        await transport.connect();

        expect(WebSocket).toHaveBeenCalledWith('ws://127.0.0.1:6463/?v=1', {
            origin: 'http://localhost'
        });
        expect(mockWsInstance.binaryType).toBe('arraybuffer');
    });

    it('should handle data, close and write', async () => {
        const transport = new WebSocketTransport(6463);
        let messageCb: any;
        let closeCb: any;

        const mockWsInstance = {
            on: vi.fn((event, cb) => {
                if (event === 'open') setTimeout(cb, 0);
                if (event === 'message') messageCb = cb;
                if (event === 'close') closeCb = cb;
            }),
            send: vi.fn(),
            close: vi.fn()
        };
        (WebSocket as any).mockImplementation(function() {
            return mockWsInstance;
        });

        await transport.connect();

        const onData = vi.fn();
        transport.onData(onData);
        
        const testData = Buffer.from('test');
        messageCb(testData);
        expect(onData).toHaveBeenCalledWith(testData);

        const onClose = vi.fn();
        transport.onClose(onClose);
        closeCb();
        expect(onClose).toHaveBeenCalled();

        transport.write(testData);
        expect(mockWsInstance.send).toHaveBeenCalledWith(testData);

        transport.close();
        expect(mockWsInstance.close).toHaveBeenCalled();
    });

    it('should reject on connection error', async () => {
        const transport = new WebSocketTransport(6463);
        const mockWsInstance = {
            on: vi.fn((event, cb) => {
                if (event === 'error') setTimeout(() => cb(new Error('Connection failed')), 0);
            })
        };
        (WebSocket as any).mockImplementation(function() {
            return mockWsInstance;
        });

        await expect(transport.connect()).rejects.toThrow('Connection failed');
    });
});
