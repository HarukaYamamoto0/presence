import {Transport} from "../types/transport";
import {NodeIPCTransport} from "./NodeIPCTransport";
import {getPlatformResolver, UnixIPCResolver} from "./IPCResolver";

/**
 * Utility for discovering and connecting to a Discord instance via IPC.
 */
export class IPCDiscovery {
	/**
	 * Searches for an active Discord instance by trying various IPC paths.
	 * @returns A connected transport instance.
	 * @throws Error if no instance is found.
	 */
	static async findTransport(): Promise<Transport> {
		const resolver = getPlatformResolver();

		// Try standard paths (0-9)
		for (let i = 0; i < 10; i++) {
			const path = resolver.getEndpoint(i);
			const transport = new NodeIPCTransport(path);

			try {
				await transport.connect();
				return transport;
			} catch (err) {
				// Keep searching if it fails
			}
		}

		// Try Flatpak if we're on Unix
		if (resolver instanceof UnixIPCResolver) {
			for (let i = 0; i < 10; i++) {
				const path = resolver.getFlatpakEndpoint(i);
				const transport = new NodeIPCTransport(path);

				try {
					await transport.connect();
					return transport;
				} catch (err) {
					// TODO: Keep searching if it fails
				}
			}
		}

		throw new Error('Could not find a running Discord instance via IPC.');
	}
}
