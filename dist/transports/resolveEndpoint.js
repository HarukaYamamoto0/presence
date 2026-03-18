export function resolveEndpoint(index) {
    if (process.platform === 'win32') {
        return `\\\\?\\pipe\\discord-ipc-${index}`;
    }
    const base = process.env.XDG_RUNTIME_DIR ??
        process.env.TMPDIR ??
        process.env.TMP ??
        process.env.TEMP ??
        '/tmp';
    return `${base}/discord-ipc-${index}`;
}
