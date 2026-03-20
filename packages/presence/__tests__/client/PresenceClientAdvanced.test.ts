import { describe, it, expect, vi } from 'vitest';
import { PresenceClient, Events } from '../../src';
import { Transport } from '../../src';
import { encode } from '../../src/protocols/encode';
import { OpCodes } from '@dispipe/protocol';

class MockTransport implements Transport {
    private onDataCb?: (data: Buffer) => void;
    private onCloseCb?: () => void;
    public writtenData: Buffer[] = [];
    public closed = false;

    async connect(): Promise<void> { return; }
    write(data: Buffer): void { this.writtenData.push(data); }
    onData(cb: (data: Buffer) => void): void { this.onDataCb = cb; }
    onClose(cb: () => void): void { this.onCloseCb = cb; }
    close(): void { this.closed = true; if (this.onCloseCb) this.onCloseCb(); }

    simulateResponse(opcode: OpCodes, data: any) {
        if (this.onDataCb) {
            this.onDataCb(encode(opcode, data));
        }
    }
}

describe('PresenceClient Advanced', () => {
    it('should handle invalid READY payload', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const onError = vi.fn();
        client.on(Events.Error, onError);

        client.connect().catch(() => {});

        // Simulate invalid READY response (missing config)
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'READY',
            data: { v: 1, user: { id: '1', username: 'u', discriminator: '0001' } },
            nonce: null
        });

        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toContain('Invalid READY payload');
    });

    it('should handle RPC error response for pending command', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        // Connect first
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'READY',
            data: { 
                v: 1, 
                config: { api_endpoint: '//discord.com', environment: 'production' }, 
                user: { id: '1', username: 'u', discriminator: '0001' } 
            },
            nonce: null
        });
        await connectPromise;

        const setActivityPromise = client.setActivity({ name: 'Test' });

        const lastWrite = transport.writtenData[transport.writtenData.length - 1];
        const payload = JSON.parse(lastWrite.subarray(8).toString());
        const nonce = payload.nonce;

        // Simulate error response
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'ERROR',
            data: { code: 4000, message: 'Bad Request' },
            nonce: nonce
        });

        await expect(setActivityPromise).rejects.toThrow('Bad Request');
    });

    it('should handle async RPC error event', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const onError = vi.fn();
        client.on(Events.Error, onError);

        // Need to simulate handshake and ready or at least ensure data is handled
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'ERROR',
            data: { code: 5000, message: 'Async Error' },
            nonce: null
        });

        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toBe('Async Error');
    });

    it('should handle Discord events', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const onJoin = vi.fn();
        const onSpectate = vi.fn();
        const onRequest = vi.fn();

        client.on(Events.ActivityJoin, onJoin);
        client.on(Events.ActivitySpectate, onSpectate);
        client.on(Events.ActivityJoinRequest, onRequest);

        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        transport.simulateResponse(OpCodes.FRAME, { evt: 'ACTIVITY_JOIN', data: { secret: 'join' }, nonce: null });
        transport.simulateResponse(OpCodes.FRAME, { evt: 'ACTIVITY_SPECTATE', data: { secret: 'spec' }, nonce: null });
        transport.simulateResponse(OpCodes.FRAME, { evt: 'ACTIVITY_JOIN_REQUEST', data: { user: {} }, nonce: null });

        expect(onJoin).toHaveBeenCalledWith({ secret: 'join' });
        expect(onSpectate).toHaveBeenCalledWith({ secret: 'spec' });
        expect(onRequest).toHaveBeenCalledWith({ user: {} });
    });

    it('should handle CLOSE opcode from Discord', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });
        
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        const onDisconnect = vi.fn();
        client.on(Events.Disconnect, onDisconnect);

        transport.simulateResponse(OpCodes.CLOSE, { code: 4000, message: 'Closed' });

        expect(onDisconnect).toHaveBeenCalled();
        expect(client.isReady).toBe(false);
    });

    it('should handle error during transport close', async () => {
        const transport = new MockTransport();
        transport.close = () => { throw new Error('Close failed'); };
        const client = new PresenceClient({ clientId: '123456789', transport });
        
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        // Disconnect should catch the error and log it, not throw
        await expect(client.disconnect()).resolves.toBeUndefined();
    });

    it('should throw if setActivity is called before connect', async () => {
        const client = new PresenceClient({ clientId: '123' });
        await expect(client.setActivity({ name: 'Test' } as any)).rejects.toThrow('Client is not ready');
    });

    it('should handle invalid response data in sendCommand', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        const setActivityPromise = client.setActivity({ name: 'Test' });
        
        const lastWrite = transport.writtenData[transport.writtenData.length - 1];
        const payload = JSON.parse(lastWrite.subarray(8).toString());
        const nonce = payload.nonce;

        // Simulate invalid response
        transport.simulateResponse(OpCodes.FRAME, {
            evt: null,
            data: { invalid: 'data' },
            nonce: nonce
        });

        await expect(setActivityPromise).rejects.toThrow('Invalid response for SET_ACTIVITY');
    });

    it('should reconnect successfully', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const disconnectSpy = vi.fn(() => Promise.resolve());
        const connectSpy = vi.fn(() => Promise.resolve({} as any));
        
        client.disconnect = disconnectSpy;
        client.connect = connectSpy;

        await client.reconnect();
        
        expect(disconnectSpy).toHaveBeenCalled();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should handle sendCommand failure', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, { 
            evt: 'READY', 
            data: { v: 1, config: { api_endpoint: '//d', environment: 'p' }, user: { id: '1', username: 'u', discriminator: '0001' } }, 
            nonce: null 
        });
        await connectPromise;

        const promise = (client as any).sendCommand('TEST', {});
        // Get the nonce
        const nonce = Array.from((client as any).pendingCommands.keys())[0];
        (client as any).pendingCommands.get(nonce).reject(new Error('Manual Reject'));
        
        await expect(promise).rejects.toThrow('Manual Reject');
    });
});
