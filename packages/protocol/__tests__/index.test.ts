import { describe, it, expect, vi } from 'vitest';
import * as Protocol from '../src';

describe('Protocol Exports', () => {
    it('should export builders and constants', () => {
        expect(Protocol.AssetsBuilder).toBeDefined();
        expect(Protocol.ButtonBuilder).toBeDefined();
        expect(Protocol.PartyBuilder).toBeDefined();
        expect(Protocol.ActivityType).toBeDefined();
        expect(Protocol.OpCodes).toBeDefined();
        expect(Protocol.RpcEvents).toBeDefined();
    });

    it('should export schemas', () => {
        expect(Protocol.ActivitySchema).toBeDefined();
        expect(Protocol.UserSchema).toBeDefined();
    });
});
