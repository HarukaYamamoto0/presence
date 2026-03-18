import EventEmitter from "node:events"
import {TransportFactory} from "../transports/TransportFactory";
import {ReadyEventSchema, ErrorEventSchema} from "../schema/events";
import {SetActivityResponseSchema} from "../schema/commands";
import {OPCODE} from "../protocols/opcodes";
import {encode} from "../protocols/encode";
import {Decoder} from "../protocols/Decoder";
import {Events, EventPayloads} from "./Events";
import {Transport} from "../types";
import {Activity} from "../structures/Activity";
import {ReadyData} from "../structures/User";

/**
 * Options for the Rich Presence client.
 */
export interface ClientOptions {
	/** Your Discord application's client ID. */
	clientId: string;
	/** Custom transport implementation (optional). */
	transport?: Transport;
}

export declare interface PresenceClient {
	on<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;
	once<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;
	emit<E extends Events>(event: E, data: EventPayloads[E]): boolean;
	off<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;
}

/**
 * The main client for managing Rich Presence.
 */
export class PresenceClient extends EventEmitter {
	private readonly clientId: string;
	private transport?: Transport;
	private readonly decoder = new Decoder();
	private _ready: boolean = false;

	constructor(options: ClientOptions) {
		super();
		this.clientId = options.clientId;
		if (options.transport) {
			this.transport = options.transport;
		}
	}

	/**
	 * Indicates if the client is currently connected and ready.
	 */
	get isReady(): boolean {
		return this._ready;
	}

	/**
	 * Connects the client to the Discord IPC socket.
	 * @throws Error if the client is already connected or no Discord instance is found.
	 */
	async connect(): Promise<this> {
		if (this._ready) {
			throw new Error("Client is already connected.");
		}

		if (!this.transport) {
			this.transport = await TransportFactory.createDefault();
		}

		this.transport.onData((chunk) => {
			const messages = this.decoder.push(chunk);
			for (const msg of messages) {
				this.handleMessage(msg);
			}
		});

		this.transport.onClose(() => {
			this.disconnect();
		});

		await this.sendHandshake();

		return new Promise((resolve, reject) => {
			const onReady = () => {
				this.off(Events.Disconnect, onDisconnect);
				resolve(this);
			};
			const onDisconnect = () => {
				this.off(Events.Ready, onReady);
				reject(new Error("Connection closed before ready."));
			};

			this.once(Events.Ready, onReady);
			this.once(Events.Disconnect, onDisconnect);
		});
	}

	/**
	 * Sets the user's presence activity.
	 * @param activity The activity to set.
	 * @param pid The process ID (defaults to the current process).
	 */
	async setActivity(activity: Activity, pid: number = process.pid): Promise<Activity> {
		if (!this._ready || !this.transport) {
			throw new Error("Client is not ready. Call connect() first.");
		}

		const nonce = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

		return new Promise((resolve, reject) => {
			const handler = (msg: { opcode: OPCODE; data: any }) => {
				if (msg.opcode === OPCODE.FRAME && msg.data.nonce === nonce) {
					this.off("message" as any, handler);
					if (msg.data.evt === "ERROR") {
						const result = ErrorEventSchema.safeParse(msg.data.data);
						reject(new Error(result.success ? result.data.message : "Failed to set activity"));
					} else {
						const result = SetActivityResponseSchema.safeParse(msg.data.data);
						if (result.success) {
							const updatedActivity = result.data;
							this.emit(Events.ActivityUpdate, updatedActivity);
							resolve(updatedActivity);
						} else {
							reject(new Error("Invalid SET_ACTIVITY response: " + result.error.message));
						}
					}
				}
			};

			this.on("message" as any, handler);

			this.transport!.write(
				encode(OPCODE.FRAME, {
					cmd: "SET_ACTIVITY",
					args: {
						pid,
						activity
					},
					nonce
				})
			);
		});
	}

	/**
	 * Disconnects and reconnects the client.
	 */
	async reconnect(): Promise<void> {
		await this.disconnect();
		await this.connect();
	}

	/**
	 * Disconnects the client from Discord.
	 */
	async disconnect(): Promise<void> {
		if (!this.transport && !this._ready) return;

		if (this.transport) {
			this.transport.close();
			this.transport = undefined;
		}

		this._ready = false;
		this.emit(Events.Disconnect, undefined as any);
	}

	async sendHandshake(): Promise<void> {
		if (!this.transport) return;

		this.transport.write(
			encode(OPCODE.HANDSHAKE, {
				v: 1,
				client_id: this.clientId
			})
		);
	}

	private handleMessage(msg: { opcode: OPCODE; data: any }) {
		if (msg.opcode === OPCODE.FRAME) {
			const {evt, data, nonce} = msg.data || {};
			if (evt === "READY") {
				const result = ReadyEventSchema.safeParse(data);
				if (result.success) {
					this._ready = true;
					this.emit(Events.Ready, result.data);
				} else {
					this.emit(Events.Error, new Error("Invalid READY payload: " + result.error.message));
				}
			} else if (evt === "ERROR") {
				const result = ErrorEventSchema.safeParse(data);
				this.emit(Events.Error, new Error(result.success ? result.data.message : "Unknown Discord error"));
			}
		} else if (msg.opcode === OPCODE.CLOSE) {
			this.disconnect();
		}

		// Emit all raw messages for advanced usage
		this.emit("message" as any, msg);
	}
}