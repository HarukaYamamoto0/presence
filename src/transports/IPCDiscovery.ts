import {Transport} from "../types/transport";
import {NodeIPCTransport} from "./NodeIPCTransport";
import {getPlatformResolver} from "./IPCResolver";
import {Logger} from "../utils/Logger";

/**
 * Utility for discovering and connecting to a Discord instance via IPC.
 */
export class IPCDiscovery {
	/**
	 * Searches for an active Discord instance by trying various IPC paths.
	 * @param logger Optional logger for discovery events.
	 * @returns A connected transport instance.
	 * @throws Error if no instance is found.
	 */
	static async findTransport(logger?: Logger): Promise<Transport> {
		const resolver = getPlatformResolver();

		// Try all possible endpoints for each index (0-9)
		for (let i = 0; i < 10; i++) {
			const paths = resolver.getEndpoints(i);

			for (const path of paths) {
				logger?.debug(`Attempting IPC connection to: ${path}`);
				const transport = new NodeIPCTransport(path);

				try {
					await transport.connect();
					logger?.info(`Connected to Discord instance via IPC: ${path}`);
					return transport;
				} catch (err) {
					// Keep searching if it fails
				}
			}
		}

		throw new Error('Could not find a running Discord instance via IPC.');
	}
}
