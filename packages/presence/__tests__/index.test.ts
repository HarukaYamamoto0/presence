import { describe, it, expect, vi } from 'vitest';
import * as Presence from '../src';

describe('Presence Exports', () => {
    it('should export all expected members', () => {
        expect(Presence.PresenceClient).toBeDefined();
        expect(Presence.ActivityBuilder).toBeDefined();
        expect(Presence.TransportFactory).toBeDefined();
        expect(Presence.Events).toBeDefined();
    });
});
