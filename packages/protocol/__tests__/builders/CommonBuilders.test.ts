import { describe, it, expect } from 'vitest';
import { ButtonBuilder } from '@dispipe/protocol';
import { PartyBuilder } from '@dispipe/protocol';
import { SecretsBuilder } from '@dispipe/protocol';
import { TimestampsBuilder } from '@dispipe/protocol';

/**
 * Tests for various builders in @dispipe/protocol
 */
describe('Builders', () => {
    describe('ButtonBuilder', () => {
        it('should build a valid button', () => {
            const button = new ButtonBuilder()
                .setLabel('Play Now')
                .setUrl('https://example.com')
                .toJSON();
            
            expect(button).toEqual({
                label: 'Play Now',
                url: 'https://example.com'
            });
        });

        it('should throw if label or url is missing', () => {
            const builder1 = new ButtonBuilder().setLabel('Only Label');
            const builder2 = new ButtonBuilder().setUrl('https://only-url.com');
            
            expect(() => builder1.toJSON()).toThrow('ButtonBuilder requires both label and url to be set.');
            expect(() => builder2.toJSON()).toThrow('ButtonBuilder requires both label and url to be set.');
        });
        
        it('should throw if URL is invalid', () => {
            const builder = new ButtonBuilder().setLabel('Invalid').setUrl('not-a-url');
            expect(() => builder.toJSON()).toThrow();
        });
    });

    describe('PartyBuilder', () => {
        it('should build a party with id and size', () => {
            const party = new PartyBuilder()
                .setId('party-123')
                .setSize(1, 5)
                .toJSON();
            
            expect(party).toEqual({
                id: 'party-123',
                size: [1, 5]
            });
        });

        it('should build a party with only id', () => {
            const party = new PartyBuilder().setId('only-id').toJSON();
            expect(party).toEqual({ id: 'only-id' });
        });
    });

    describe('SecretsBuilder', () => {
        it('should build secrets', () => {
            const secrets = new SecretsBuilder()
                .setJoin('join-secret')
                .setSpectate('spectate-secret')
                .setMatch('match-secret')
                .toJSON();
            
            expect(secrets).toEqual({
                join: 'join-secret',
                spectate: 'spectate-secret',
                match: 'match-secret'
            });
        });
    });

    describe('TimestampsBuilder', () => {
        it('should set start and end using numbers', () => {
            const start = 1710892800000;
            const end = 1710896400000;
            const ts = new TimestampsBuilder()
                .setStart(start)
                .setEnd(end)
                .toJSON();
            
            expect(ts).toEqual({ start, end });
        });

        it('should set start and end using Date objects', () => {
            const startDate = new Date('2024-03-20T00:00:00Z');
            const endDate = new Date('2024-03-20T01:00:00Z');
            const ts = new TimestampsBuilder()
                .setStart(startDate)
                .setEnd(endDate)
                .toJSON();
            
            expect(ts.start).toBe(startDate.getTime());
            expect(ts.end).toBe(endDate.getTime());
        });
    });
});
