import { describe, it, expect, vi } from 'vitest';
import { Decoder } from '../../src/protocols/Decoder';
import { OpCodes } from '@dispipe/protocol';
import { encode } from '../../src/protocols/encode';

describe('Decoder', () => {
    it('should decode a single message', () => {
        const decoder = new Decoder();
        const payload = { test: 'data' };
        const chunk = encode(OpCodes.FRAME, payload);
        
        const messages = decoder.push(chunk);
        expect(messages).toHaveLength(1);
        expect(messages[0].opcode).toBe(OpCodes.FRAME);
        expect(messages[0].data).toEqual(payload);
    });

    it('should decode multiple messages in one chunk', () => {
        const decoder = new Decoder();
        const p1 = { id: 1 };
        const p2 = { id: 2 };
        const chunk = Buffer.concat([
            encode(OpCodes.FRAME, p1),
            encode(OpCodes.FRAME, p2)
        ]);
        
        const messages = decoder.push(chunk);
        expect(messages).toHaveLength(2);
        expect(messages[0].data).toEqual(p1);
        expect(messages[1].data).toEqual(p2);
    });

    it('should handle fragmented messages', () => {
        const decoder = new Decoder();
        const payload = { long: 'a'.repeat(100) };
        const chunk = encode(OpCodes.FRAME, payload);
        
        const part1 = chunk.subarray(0, 10);
        const part2 = chunk.subarray(10);
        
        expect(decoder.push(part1)).toHaveLength(0);
        const messages = decoder.push(part2);
        expect(messages).toHaveLength(1);
        expect(messages[0].data).toEqual(payload);
    });

    it('should skip invalid JSON', () => {
        const decoder = new Decoder();
        const header = Buffer.alloc(8);
        header.writeInt32LE(OpCodes.FRAME, 0);
        header.writeInt32LE(5, 4);
        const invalidJson = Buffer.from('not{j');
        
        const messages = decoder.push(Buffer.concat([header, invalidJson]));
        expect(messages).toHaveLength(0);
    });

    it('should continue after invalid JSON if more data exists', () => {
        const decoder = new Decoder();
        
        // Invalid message
        const h1 = Buffer.alloc(8);
        h1.writeInt32LE(OpCodes.FRAME, 0);
        h1.writeInt32LE(5, 4);
        const b1 = Buffer.from('error');
        
        // Valid message
        const b2 = encode(OpCodes.FRAME, { ok: true });
        
        const messages = decoder.push(Buffer.concat([h1, b1, b2]));
        expect(messages).toHaveLength(1);
        expect(messages[0].data).toEqual({ ok: true });
    });
});
