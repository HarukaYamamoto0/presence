import { describe, it, expect } from 'vitest';
import { PresenceClient } from '../src/client/PresenceClient';
import { Events } from '../src/client/Events';
import { ActivityBuilder } from '../src/builders/ActivityBuilder';
import { Transport } from '../src/types/transport';
import { OpCodes } from '@dispipe/protocol';
import { encode } from '../src/protocols/encode';
import { vi } from 'vitest';

/**
 * Mock Transport for Use Case Tests
 */
class MockTransport implements Transport {
    public onDataCb?: (data: Buffer) => void;
    public lastPayload: any = null;

    async connect() {}
    write(data: Buffer) {
        this.lastPayload = JSON.parse(data.subarray(8).toString());
    }
    onData(cb: (data: Buffer) => void) { this.onDataCb = cb; }
    onClose() {}
    close() {}

    respond(nonce: string, data: any) {
        this.onDataCb?.(encode(OpCodes.FRAME, { evt: null, data, nonce }));
    }
    
    ready() {
        const data = {
            v: 1,
            config: {
                api_endpoint: "//discord.com/api",
                environment: "production"
            },
            user: {
                id: "123",
                username: "testuser",
                discriminator: "0001"
            }
        };
        this.onDataCb?.(encode(OpCodes.FRAME, { evt: 'READY', data, nonce: null }));
    }
}

describe('Discord Presence Use Cases', () => {
    it('should set a complex gaming activity', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        
        const connect = client.connect();
        transport.ready();
        await connect;

        const activity = new ActivityBuilder()
            .setName('Space Explorers')
            .setState('Exploring Mars')
            .setDetails('Mission: Alpha')
            .setStartTimestamp(Date.now())
            .setLargeImage('mars_base', 'Mars Colony')
            .setSmallImage('astronaut', 'Major Tom')
            .addButton({ label: 'Join Mission', url: 'https://space.game/join' })
            .build();

        const setActivity = client.setActivity(activity);
        
        const nonce = transport.lastPayload.nonce;
        transport.respond(nonce, activity);
        
        await setActivity;

        expect(transport.lastPayload.args.activity.name).toBe('Space Explorers');
        expect(transport.lastPayload.args.activity.assets.large_image).toBe('mars_base');
    });

    it('should set a listening activity', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        
        const connect = client.connect();
        transport.ready();
        await connect;

        const activity = new ActivityBuilder()
            .setName('Lo-Fi Radio')
            .setState('Chilling')
            .setType(2) // Listening
            .setDetails('Lofi Girl - Study Sleep Relax')
            .build();

        const setActivity = client.setActivity(activity);
        
        const nonce = transport.lastPayload.nonce;
        transport.respond(nonce, activity);
        
        await setActivity;

        expect(transport.lastPayload.args.activity.type).toBe(2);
        expect(transport.lastPayload.args.activity.name).toBe('Lo-Fi Radio');
    });

    it('should set an activity with party and secrets', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        
        const connect = client.connect();
        transport.ready();
        await connect;

        const activity = new ActivityBuilder()
            .setName('Competitive Match')
            .setParty({ id: 'party-id', size: [2, 5] })
            .setSecrets({ join: 'join-me' })
            .build();

        const setActivity = client.setActivity(activity);
        
        const nonce = transport.lastPayload.nonce;
        transport.respond(nonce, activity);
        
        await setActivity;

        expect(transport.lastPayload.args.activity.party.id).toBe('party-id');
        expect(transport.lastPayload.args.activity.party.size).toEqual([2, 5]);
        expect(transport.lastPayload.args.activity.secrets.join).toBe('join-me');
    });

    it('should handle activity update event from Discord', async () => {
        const transport = new MockTransport();
        const client = new PresenceClient({ clientId: '123', transport });
        
        const connect = client.connect();
        transport.ready();
        await connect;

        const onUpdate = vi.fn();
        client.on(Events.ActivityUpdate, onUpdate);

        const updatedActivity = { name: 'Remote Update' };
        
        // Simulate an unsolicited update from Discord (DISPATCH)
        transport.onDataCb?.(encode(OpCodes.FRAME, {
            evt: 'ACTIVITY_UPDATE',
            data: updatedActivity,
            nonce: null
        }));

        expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Remote Update' }));
    });
});
