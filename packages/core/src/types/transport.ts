export interface Transport {
	connect(): Promise<void>;
	write(data: Buffer): void;
	onData(cb: (data: Buffer) => void): void;
	onClose(cb: () => void): void;
	close(): void;
}

interface HandshakePayload {
	v: number;
	encoding: string;
	client_id: string;
	frame_id: string;
	sdk_version?: string;
}