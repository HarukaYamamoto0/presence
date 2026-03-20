import { describe, it, expect, vi } from 'vitest';
import { ActivityBuilder } from '../../src';
import { 
    TimestampsBuilder, 
    PartyBuilder, 
    AssetsBuilder, 
    SecretsBuilder, 
    ButtonBuilder 
} from '@dispipe/protocol';

/**
 * Tests for ActivityBuilder in @dispipe/presence
 */
describe('ActivityBuilder', () => {
    it('should build a simple activity', () => {
        const activity = new ActivityBuilder()
            .setName('My Awesome Game')
            .setState('In a Match')
            .setDetails('Level 42')
            .toJSON();
        
        expect(activity.name).toBe('My Awesome Game');
        expect(activity.state).toBe('In a Match');
        expect(activity.details).toBe('Level 42');
    });

    it('should set timestamps', () => {
        const start = Date.now();
        const activity = new ActivityBuilder()
            .setName('Test')
            .setStartTimestamp(start)
            .toJSON();
        
        expect(activity.timestamps?.start).toBe(start);
    });

    it('should set assets with large and small images', () => {
        const activity = new ActivityBuilder()
            .setName('Test')
            .setLargeImage('large_key', 'Large Text')
            .setSmallImage('small_key', 'Small Text')
            .toJSON();
        
        expect(activity.assets?.large_image).toBe('large_key');
        expect(activity.assets?.large_text).toBe('Large Text');
        expect(activity.assets?.small_image).toBe('small_key');
        expect(activity.assets?.small_text).toBe('Small Text');
    });

    it('should add buttons (max 2)', () => {
        const activity = new ActivityBuilder()
            .setName('Test')
            .addButton({ label: 'Button 1', url: 'https://example.com/1' })
            .addButton({ label: 'Button 2', url: 'https://example.com/2' })
            .toJSON();
        
        expect(activity.buttons).toHaveLength(2);
        expect(activity.buttons?.[0]).toEqual({ label: 'Button 1', url: 'https://example.com/1' });
    });

    it('should throw if adding more than 2 buttons', () => {
        const builder = new ActivityBuilder()
            .setName('Test')
            .addButton({ label: 'B1', url: 'https://e.com/1' })
            .addButton({ label: 'B2', url: 'https://e.com/2' })
            .addButton({ label: 'B3', url: 'https://e.com/3' });
        
        expect(() => builder.toJSON()).toThrow();
    });

    it('should set activity type', () => {
        const activity = new ActivityBuilder()
            .setName('Listening')
            .setType(2) // Listening
            .toJSON();
        
        expect(activity.type).toBe(2);
    });

    it('should set party using builder or object', () => {
        const partyBuilder = new PartyBuilder().setId('builder-id');
        const activity1 = new ActivityBuilder()
            .setName('Test')
            .setParty(partyBuilder)
            .toJSON();
        expect(activity1.party?.id).toBe('builder-id');

        const activity2 = new ActivityBuilder()
            .setName('Test')
            .setParty({ id: '123' })
            .toJSON();
        expect(activity2.party?.id).toBe('123');
    });

    it('should set assets using builder or object', () => {
        const assetsBuilder = new AssetsBuilder().setLargeImage('builder-large');
        const activity1 = new ActivityBuilder()
            .setName('Test')
            .setAssets(assetsBuilder)
            .toJSON();
        expect(activity1.assets?.large_image).toBe('builder-large');

        const activity2 = new ActivityBuilder()
            .setName('Test')
            .setAssets({ large_image: 'large' })
            .toJSON();
        expect(activity2.assets?.large_image).toBe('large');
    });

    it('should set secrets using builder or object', () => {
        const secretsBuilder = new SecretsBuilder().setJoin('builder-join');
        const activity1 = new ActivityBuilder()
            .setName('Test')
            .setSecrets(secretsBuilder)
            .toJSON();
        expect(activity1.secrets?.join).toBe('builder-join');

        const activity2 = new ActivityBuilder()
            .setName('Test')
            .setSecrets({ join: 'secret' })
            .toJSON();
        expect(activity2.secrets?.join).toBe('secret');
    });

    it('should add buttons using builder or object', () => {
        const buttonBuilder = new ButtonBuilder().setLabel('Builder B').setUrl('https://b.com');
        const activity = new ActivityBuilder()
            .setName('Test')
            .addButton(buttonBuilder)
            .addButton({ label: 'Object B', url: 'https://o.com' })
            .toJSON();
        
        expect(activity.buttons).toHaveLength(2);
        const button1 = activity.buttons?.[0];
        const button2 = activity.buttons?.[1];
        expect(typeof button1 === 'object' ? button1?.label : button1).toBe('Builder B');
        expect(typeof button2 === 'object' ? button2?.label : button2).toBe('Object B');
    });

    it('should set start and end timestamps using Date objects', () => {
        const start = new Date(2023, 0, 1);
        const end = new Date(2023, 0, 1, 1);
        const activity = new ActivityBuilder()
            .setName('Test')
            .setStartTimestamp(start)
            .setEndTimestamp(end)
            .toJSON();
        expect(activity.timestamps?.start).toBe(start.getTime());
        expect(activity.timestamps?.end).toBe(end.getTime());
    });

    it('should set instance', () => {
        const activity = new ActivityBuilder()
            .setName('Test')
            .setInstance(true)
            .toJSON();
        expect(activity.instance).toBe(true);
    });

    it('should set state_url and details_url', () => {
        const activity = new ActivityBuilder()
            .setName('Test')
            .setStateUrl('https://example.com/state')
            .setDetailsUrl('https://example.com/details')
            .toJSON();
        expect(activity.state_url).toBe('https://example.com/state');
        expect(activity.details_url).toBe('https://example.com/details');
    });

    it('should set timestamps using builder object', () => {
        const start = Date.now();
        const end = start + 1000;
        const tsBuilder = new TimestampsBuilder().setStart(start).setEnd(end);
        
        const activity = new ActivityBuilder()
            .setName('Test')
            .setTimestamps(tsBuilder)
            .toJSON();
        
        expect(activity.timestamps?.start).toBe(start);
        expect(activity.timestamps?.end).toBe(end);

        const activity2 = new ActivityBuilder()
            .setName('Test')
            .setTimestamps({ start, end })
            .toJSON();
        expect(activity2.timestamps?.start).toBe(start);
        expect(activity2.timestamps?.end).toBe(end);
    });

    it('should throw if name is missing in toJSON', () => {
        const builder = new ActivityBuilder();
        expect(() => builder.toJSON()).toThrow('ActivityBuilder requires name to be set.');
    });

    it('should produce a valid build result', () => {
        const buildResult = new ActivityBuilder()
            .setName('Build Test')
            .build();
        
        expect(buildResult).toHaveProperty('name', 'Build Test');
    });
});
