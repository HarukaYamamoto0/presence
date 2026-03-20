import { describe, it, expect } from 'vitest';
import { UserSchema, ActivitySchema } from '@dispipe/protocol';

/**
 * Tests for Zod Schemas in @dispipe/protocol
 */
describe('Schemas', () => {
    describe('UserSchema', () => {
        it('should validate a valid user', () => {
            const user = {
                id: '123456789',
                username: 'testuser',
                discriminator: '0001',
                global_name: 'Test User',
                avatar: 'avatar_hash'
            };
            expect(UserSchema.parse(user)).toEqual(user);
        });

        it('should fail if missing required fields', () => {
            const invalidUser = { id: '123' };
            expect(() => UserSchema.parse(invalidUser)).toThrow();
        });
    });

    describe('ActivitySchema', () => {
        it('should validate a minimum valid activity', () => {
            const activity = { name: 'Test Game' };
            const result = ActivitySchema.parse(activity);
            expect(result.name).toBe('Test Game');
            // type is optional, if not provided it won't be in the object unless defaulted
        });

        it('should fail if name is missing', () => {
            expect(() => ActivitySchema.parse({})).toThrow();
        });

        it('should validate buttons correctly', () => {
            const activity = {
                name: 'Test',
                buttons: [
                    { label: 'B1', url: 'https://e.com/1' },
                    { label: 'B2', url: 'https://e.com/2' }
                ]
            };
            expect(() => ActivitySchema.parse(activity)).not.toThrow();
        });

        it('should fail if more than 2 buttons', () => {
            const activity = {
                name: 'Test',
                buttons: [
                    { label: 'B1', url: 'https://e.com/1' },
                    { label: 'B2', url: 'https://e.com/2' },
                    { label: 'B3', url: 'https://e.com/3' }
                ]
            };
            expect(() => ActivitySchema.parse(activity)).toThrow();
        });
    });
});
