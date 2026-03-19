/**
 * Interface for Discord IPC socket path providers.
 */
export interface IPCResolver {
	/**
	 * Returns a list of possible paths for the Discord socket.
	 * @param index The socket index (0-9).
	 */
	getEndpoints(index: number): string[];
}

/**
 * IPC socket resolver for Windows-based systems.
 */
export class WindowsIPCResolver implements IPCResolver {
	getEndpoints(index: number): string[] {
		return [`\\\\?\\pipe\\discord-ipc-${index}`];
	}
}

/**
 * IPC socket resolver for Unix-based systems (Linux, macOS).
 */
export class UnixIPCResolver implements IPCResolver {
	private static readonly SEARCH_PATHS = [
		'',
		'app/com.discordapp.Discord/',
		'app/dev.vencord.Vesktop/',
		'.flatpak/com.discordapp.Discord/xdg-run/',
		'.flatpak/dev.vencord.Vesktop/xdg-run/',
		'snap.discord-canary/',
		'snap.discord/',
	];

	getEndpoints(index: number): string[] {
		const base =
			process.env.XDG_RUNTIME_DIR ??
			process.env.TMPDIR ??
			process.env.TMP ??
			process.env.TEMP ??
			'/tmp';

		return UnixIPCResolver.SEARCH_PATHS.map((path) => `${base}/${path}discord-ipc-${index}`);
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
