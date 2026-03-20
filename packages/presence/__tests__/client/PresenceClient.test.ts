import { describe, it, expect, vi } from 'vitest';
import { PresenceClient } from '../../src';
import { Events } from '../../src';
import { Transport } from '../../src';
import { encode } from '../../src/protocols/encode';
import { OpCodes } from '@dispipe/protocol';

/**
 * Mock Transport for testing PresenceClient
 */
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

    // Helper to simulate receiving data from Discord
    simulateResponse(opcode: OpCodes, data: any) {
        if (this.onDataCb) {
            this.onDataCb(encode(opcode, data));
        }
    }
}

describe('PresenceClient', () => {
    it('should initialize with client ID', () => {
        const client = new PresenceClient({ clientId: '123456789' });
        expect(client).toBeDefined();
    });

    it('should handle handshake and ready event', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const connectPromise = client.connect();

        // Simulate READY response from Discord
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'READY',
            data: {
                v: 1,
                config: {
                    api_endpoint: "//discord.com/api",
                    environment: "production"
                },
                user: { id: '1', username: 'testuser', discriminator: '0001' }
            },
            nonce: null
        });

        await expect(connectPromise).resolves.toBeDefined();
        expect(client.isReady).toBe(true);
    });

    it('should send SET_ACTIVITY command', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        // Connect first
        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'READY',
            data: {
                v: 1,
                config: {
                    api_endpoint: "//discord.com/api",
                    environment: "production"
                },
                user: { id: '1', username: 'testuser', discriminator: '0001' }
            },
            nonce: null
        });
        await connectPromise;

        // Set activity
        const activity = { name: 'Testing' };
        const setActivityPromise = client.setActivity(activity);

        // Find the nonce in the written data to simulate a response
        const lastWrite = transport.writtenData[transport.writtenData.length - 1];
        const payload = JSON.parse(lastWrite.subarray(8).toString());
        const nonce = payload.nonce;

        transport.simulateResponse(OpCodes.FRAME, {
            evt: null,
            data: activity,
            nonce: nonce
        });

        await expect(setActivityPromise).resolves.toBeDefined();
    });

    it('should handle disconnect', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123456789', transport });

        const onDisconnected = vi.fn();
        client.on(Events.Disconnect, onDisconnected);

        const connectPromise = client.connect();
        transport.simulateResponse(OpCodes.FRAME, {
            evt: 'READY',
            data: {
                v: 1,
                config: {
                    api_endpoint: "//discord.com/api",
                    environment: "production"
                },
                user: { id: '1', username: 'testuser', discriminator: '0001' }
            },
            nonce: null
        });
        await connectPromise;
        
        transport.close();
        expect(onDisconnected).toHaveBeenCalled();
    });
});
