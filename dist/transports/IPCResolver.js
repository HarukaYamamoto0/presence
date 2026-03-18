/**
 * IPC socket resolver for Windows-based systems.
 */
export class WindowsIPCResolver {
    getEndpoint(index) {
        return `\\\\?\\pipe\\discord-ipc-${index}`;
    }
}
/**
 * IPC socket resolver for Unix-based systems (Linux, macOS).
 */
export class UnixIPCResolver {
    getEndpoint(index) {
        const base = process.env.XDG_RUNTIME_DIR ??
            process.env.TMPDIR ??
            process.env.TMP ??
            process.env.TEMP ??
            '/tmp';
        return `${base}/discord-ipc-${index}`;
    }
}
/**
 * Returns the appropriate resolver for the current platform.
 */
export function getPlatformResolver() {
    if (process.platform === 'win32') {
        return new WindowsIPCResolver();
    }
    return new UnixIPCResolver();
}
