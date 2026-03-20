import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeIPCTransport } from '../../src/transports/NodeIPCTransport';
import net from 'net';

vi.mock('net', () => ({
    default: {
        createConnection: vi.fn(),
    },
}));

describe('NodeIPCTransport', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should connect to correct path', async () => {
        const transport = new NodeIPCTransport('/tmp/discord-ipc-0');
        
        const mockSocket = {
            once: vi.fn((event, cb) => {
                if (event === 'error') return; // Do nothing for error
            }),
            on: vi.fn(),
            write: vi.fn(),
            end: vi.fn(),
            unref: vi.fn(),
            destroy: vi.fn()
        };
        (net.createConnection as any).mockImplementation((path: string, resolve: () => void) => {
            setTimeout(resolve, 0);
            return mockSocket;
        });

        await transport.connect();

        expect(net.createConnection).toHaveBeenCalledWith('/tmp/discord-ipc-0', expect.any(Function));
    });

    it('should handle data, close and write', async () => {
        const transport = new NodeIPCTransport('/tmp/discord-ipc-0');
        let dataCb: any;
        let closeCb: any;

        const mockSocket = {
            once: vi.fn((event, cb) => {
                if (event === 'close') closeCb = cb;
            }),
            on: vi.fn((event, cb) => {
                if (event === 'data') dataCb = cb;
            }),
            write: vi.fn(),
            end: vi.fn(),
            unref: vi.fn(),
            destroy: vi.fn()
        };
        (net.createConnection as any).mockImplementation((path: string, resolve: () => void) => {
            setTimeout(resolve, 0);
            return mockSocket;
        });

        await transport.connect();

        const onData = vi.fn();
        transport.onData(onData);
        dataCb(Buffer.from('test'));
        expect(onData).toHaveBeenCalledWith(Buffer.from('test'));

        const onClose = vi.fn();
        transport.onClose(onClose);
        closeCb();
        expect(onClose).toHaveBeenCalled();

        transport.write(Buffer.from('hello'));
        expect(mockSocket.write).toHaveBeenCalledWith(Buffer.from('hello'));

        transport.close();
        expect(mockSocket.end).toHaveBeenCalled();
        expect(mockSocket.unref).toHaveBeenCalled();
        expect(mockSocket.destroy).toHaveBeenCalled();
    });

    it('should reject on connection error', async () => {
        const transport = new NodeIPCTransport('/tmp/discord-ipc-0');
        const mockSocket = {
            once: vi.fn((event, cb) => {
                if (event === 'error') setTimeout(() => cb(new Error('IPC Connection Failed')), 0);
            })
        };
        (net.createConnection as any).mockReturnValue(mockSocket);

        await expect(transport.connect()).rejects.toThrow('IPC Connection Failed');
    });
});
