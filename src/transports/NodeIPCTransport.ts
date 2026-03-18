import net from 'net';
import {Transport} from "../types";

export class NodeIPCTransport implements Transport {
	private socket!: net.Socket;

	constructor(private path: string) {
	}

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = net.createConnection(this.path, resolve);
			this.socket.once('error', reject);
		});
	}

	write(data: Buffer) {
		this.socket.write(data);
	}

	onData(cb: (data: Buffer) => void) {
		this.socket.on('data', cb);
	}

	onClose(cb: () => void) {
		this.socket.once('close', cb);
	}

	close() {
		this.socket.end();
		this.socket.unref();
		this.socket.destroy();
	}
}