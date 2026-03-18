import {Transport} from "../types";
import {IPCDiscovery} from "./IPCDiscovery";
import {WebSocketTransport} from "./WebSocketTransport";

/**
 * Factory for creating and discovering transports.
 */
export class TransportFactory {
	/**
	 * Tries to find and create a suitable transport.
	 * Currently, supports IPC and WebSocket.
	 * @returns The connected transport.
	 */
	static async createDefault(): Promise<Transport> {
		try {
			return await IPCDiscovery.findTransport();
		} catch (ipcErr) {
			// If IPC fails, try WebSocket ports (6463-6472)
			for (let port = 6463; port <= 6472; port++) {
				const transport = new WebSocketTransport(port);
				try {
					await transport.connect();
					return transport;
				} catch (wsErr) {
					// Keep searching
				}
			}
			throw new Error('Could not find a running Discord instance via IPC or WebSocket.');
		}
	}
}
