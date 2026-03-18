import {Transport} from "../types";
import {IPCDiscovery} from "./IPCDiscovery";

/**
 * Factory for creating and discovering transports.
 */
export class TransportFactory {
	/**
	 * Tries to find and create a suitable transport.
	 * Currently only supports IPC for local Discord.
	 * @returns The connected transport.
	 */
	static async createDefault(): Promise<Transport> {
		// For now, the only transport method is IPC (local)
		return IPCDiscovery.findTransport();
	}
}
