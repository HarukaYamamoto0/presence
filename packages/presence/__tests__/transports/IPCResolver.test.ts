import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UnixIPCResolver, WindowsIPCResolver, getPlatformResolver } from '../../src/transports/IPCResolver';

describe('IPCResolver', () => {
    describe('WindowsIPCResolver', () => {
        it('should return correct endpoints for Windows', () => {
            const resolver = new WindowsIPCResolver();
            expect(resolver.getEndpoints(0)).toEqual(['\\\\?\\pipe\\discord-ipc-0']);
            expect(resolver.getEndpoints(9)).toEqual(['\\\\?\\pipe\\discord-ipc-9']);
        });
    });

    describe('UnixIPCResolver', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should use XDG_RUNTIME_DIR if available', () => {
            process.env.XDG_RUNTIME_DIR = '/run/user/1000';
            const resolver = new UnixIPCResolver();
            const endpoints = resolver.getEndpoints(0);
            expect(endpoints).toContain('/run/user/1000/discord-ipc-0');
        });

        it('should fallback to /tmp if no env vars are set', () => {
            delete process.env.XDG_RUNTIME_DIR;
            delete process.env.TMPDIR;
            delete process.env.TMP;
            delete process.env.TEMP;
            const resolver = new UnixIPCResolver();
            const endpoints = resolver.getEndpoints(0);
            expect(endpoints).toContain('/tmp/discord-ipc-0');
        });

        it('should include all search paths', () => {
            process.env.XDG_RUNTIME_DIR = '/tmp';
            const resolver = new UnixIPCResolver();
            const endpoints = resolver.getEndpoints(0);
            expect(endpoints).toContain('/tmp/app/com.discordapp.Discord/discord-ipc-0');
            expect(endpoints).toContain('/tmp/snap.discord/discord-ipc-0');
        });
    });

    describe('getPlatformResolver', () => {
        it('should return correct resolver based on platform', () => {
            const originalPlatform = process.platform;
            
            Object.defineProperty(process, 'platform', { value: 'win32' });
            expect(getPlatformResolver()).toBeInstanceOf(WindowsIPCResolver);
            
            Object.defineProperty(process, 'platform', { value: 'linux' });
            expect(getPlatformResolver()).toBeInstanceOf(UnixIPCResolver);

            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
    });
});
