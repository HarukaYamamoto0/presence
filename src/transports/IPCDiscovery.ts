import {Transport} from "../types";
import {NodeIPCTransport} from "./NodeIPCTransport";
import {getPlatformResolver} from "./IPCResolver";

/**
 * Utility for discovering and connecting to a Discord instance via IPC.
 */
export class IPCDiscovery {
	/**
	 * Searches for an active Discord instance by trying the first 10 IPC sockets.
	 * @returns A connected transport instance.
	 * @throws Error if no instance is found.
	 */
	static async findTransport(): Promise<Transport> {
		const resolver = getPlatformResolver();

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
		throw new Error('Could not find a running Discord instance.');
	}
}
