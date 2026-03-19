import {Transport} from "../types/transport";
import {IPCDiscovery} from "./IPCDiscovery";
import {WebSocketTransport} from "./WebSocketTransport";
import {Logger} from "../utils/Logger";

/**
 * Factory for creating and discovering transports.
 */
export class TransportFactory {
	/**
	 * Tries to find and create a suitable transport.
	 * Currently, supports IPC and WebSocket.
	 * @param logger Optional logger for discovery events.
	 * @returns The connected transport.
	 */
	static async createDefault(logger?: Logger): Promise<Transport> {
		try {
			logger?.debug("Attempting to find Discord instance via IPC...");
			return await IPCDiscovery.findTransport(logger);
		} catch (ipcErr) {
			logger?.warn(`IPC discovery failed: ${(ipcErr as Error).message}. Falling back to WebSocket.`);
			// If IPC fails, try WebSocket ports (6463-6472)
			for (let port = 6463; port <= 6472; port++) {
				logger?.debug(`Attempting to connect to Discord via WebSocket on port ${port}...`);
				const transport = new WebSocketTransport(port);
				try {
					await transport.connect();
					logger?.info(`Connected to Discord via WebSocket on port ${port}.`);
					return transport;
				} catch (wsErr) {
					// Keep searching
				}
			}
			throw new Error('Could not find a running Discord instance via IPC or WebSocket.');
		}
	}
}
