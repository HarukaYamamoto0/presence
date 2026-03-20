import { describe, it, expect } from 'vitest';
import { AssetsBuilder } from '@dispipe/protocol';

/**
 * Tests for AssetsBuilder in @dispipe/protocol
 */
describe('AssetsBuilder', () => {
    it('should build an empty assets object', () => {
        const builder = new AssetsBuilder();
        const assets = builder.toJSON();
        expect(assets).toEqual({});
    });

    it('should set large image and text', () => {
        const builder = new AssetsBuilder()
            .setLargeImage('large_key')
            .setLargeText('Large Hover Text');
        
        const assets = builder.toJSON();
        expect(assets.large_image).toBe('large_key');
        expect(assets.large_text).toBe('Large Hover Text');
    });

    it('should set small image and text', () => {
        const builder = new AssetsBuilder()
            .setSmallImage('small_key')
            .setSmallText('Small Hover Text');
        
        const assets = builder.toJSON();
        expect(assets.small_image).toBe('small_key');
        expect(assets.small_text).toBe('Small Hover Text');
    });

    it('should set URLs explicitly', () => {
        const builder = new AssetsBuilder()
            .setLargeUrl('https://example.com/large.png')
            .setSmallUrl('https://example.com/small.png');
        
        const assets = builder.toJSON();
        expect(assets.large_url).toBe('https://example.com/large.png');
        expect(assets.small_url).toBe('https://example.com/small.png');
    });

    it('should validate image URL extension via Zod schema', () => {
        const builder = new AssetsBuilder()
            .setLargeImage('https://example.com/image.gif');
        
        // Zod should throw because .gif is not supported in the schema for large_image if it starts with http
        expect(() => builder.toJSON()).toThrow();
    });

    it('should allow valid image URL extensions', () => {
        const builder = new AssetsBuilder()
            .setLargeImage('https://example.com/image.png');
        
        expect(() => builder.toJSON()).not.toThrow();
        expect(builder.toJSON().large_image).toBe('https://example.com/image.png');
    });
});
