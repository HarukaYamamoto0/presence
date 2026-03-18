import {WebSocket} from 'ws';
import {Transport} from "../types";

export class WebSocketTransport implements Transport {
	private socket!: WebSocket;

	constructor(private port: number) {
	}

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(`ws://127.0.0.1:${this.port}/?v=1`, {
				origin: 'http://localhost'
			});
			this.socket.binaryType = 'arraybuffer';
			this.socket.on('open', resolve);
			this.socket.on('error', reject);
		});
	}

	write(data: Buffer) {
		this.socket.send(data);
	}

	onData(cb: (data: Buffer) => void) {
		this.socket.on('message', (data: any) => {
			cb(Buffer.from(data));
		});
	}

	onClose(cb: () => void) {
		this.socket.on('close', cb);
	}

	close() {
		this.socket.close();
	}
}
