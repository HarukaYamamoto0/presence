import { describe, it, expect } from 'vitest';
import { ActivityBuilder } from '../../src';

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

    it('should produce a valid build result', () => {
        const buildResult = new ActivityBuilder()
            .setName('Build Test')
            .build();
        
        expect(buildResult).toHaveProperty('name', 'Build Test');
    });
});
