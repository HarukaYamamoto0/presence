export interface Transport {
	connect(): Promise<void>;
	write(data: Buffer): void;
	onData(cb: (data: Buffer) => void): void;
	onClose(cb: () => void): void;
	close(): void;
}

export enum Platform {
	Linux,
	Windows
}

