/**
 * Interface for Discord IPC socket path providers.
 */
export interface IPCResolver {
	/**
	 * Returns a list of possible paths for the Discord socket.
	 * @param index The socket index (0-9).
	 */
	getEndpoint(index: number): string;
}

/**
 * IPC socket resolver for Windows-based systems.
 */
export class WindowsIPCResolver implements IPCResolver {
	getEndpoint(index: number): string {
		return `\\\\?\\pipe\\discord-ipc-${index}`;
	}
}

/**
 * IPC socket resolver for Unix-based systems (Linux, macOS).
 */
export class UnixIPCResolver implements IPCResolver {
	getEndpoint(index: number): string {
		const base =
			process.env.XDG_RUNTIME_DIR ??
			process.env.TMPDIR ??
			process.env.TMP ??
			process.env.TEMP ??
			'/tmp';

		return `${base}/discord-ipc-${index}`;
	}

	/**
	 * Returns flatpak specific paths.
	 * Flatpak can access common runtime directories, but sometimes they are namespaced.
	 */
	getFlatpakEndpoint(index: number): string {
		const base = process.env.XDG_RUNTIME_DIR ?? '/run/user/1000';
		return `${base}/app/com.discordapp.Discord/discord-ipc-${index}`;
	}
}

/**
 * Returns the appropriate resolver for the current platform.
 */
export function getPlatformResolver(): IPCResolver {
	if (process.platform === 'win32') {
		return new WindowsIPCResolver();
	}
	return new UnixIPCResolver();
}
