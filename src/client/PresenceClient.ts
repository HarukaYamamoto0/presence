import * as zod from 'zod';
import EventEmitter from "node:events"
import {TransportFactory} from "../transports/TransportFactory";
import {ReadyEventSchema, ErrorEventSchema} from "../schema/events";
import {SetActivityResponseSchema} from "../schema/commands";
import {encode} from "../protocols/encode";
import {Decoder} from "../protocols/Decoder";
import {Events, EventPayloads} from "./Events";
import {Transport} from "../types";
import {Activity} from "../structures/Activity";
import {ReadyData} from "../structures/User";
import {OpCodes} from "../constants";

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
	private pendingCommands = new Map<string, { resolve: (data: any) => void; reject: (err: Error) => void }>();

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

		return this.sendCommand("SET_ACTIVITY", {
			pid,
			activity
		}, SetActivityResponseSchema);
	}

	/**
	 * Sends a command to Discord and waits for the response.
	 */
	async sendCommand<T>(cmd: string, args: any, schema?: zod.ZodSchema<T>): Promise<T> {
		if (!this.transport) throw new Error("Transport not connected");

		const nonce = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

		return new Promise((resolve, reject) => {
			this.pendingCommands.set(nonce, {
				resolve: (data) => {
					if (!schema) return resolve(data as T);
					const result = schema.safeParse(data);
					if (result.success) {
						resolve(result.data);
					} else {
						reject(new Error(`Invalid response for ${cmd}: ${result.error.message}`));
					}
				},
				reject
			});

			this.transport!.write(
				encode(OpCodes.FRAME, {
					cmd,
					args,
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
			encode(OpCodes.HANDSHAKE, {
				v: 1,
				client_id: this.clientId
			})
		);
	}

	private handleMessage(msg: { opcode: OpCodes; data: any }) {
		if (msg.opcode === OpCodes.FRAME) {
			const {evt, data, nonce} = msg.data || {};

			if (nonce && this.pendingCommands.has(nonce)) {
				const {resolve, reject} = this.pendingCommands.get(nonce)!;
				this.pendingCommands.delete(nonce);

				if (evt === "ERROR") {
					const result = ErrorEventSchema.safeParse(data);
					reject(new Error(result.success ? result.data.message : "Discord error"));
					return;
				}
				resolve(data);
				return;
			}

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
			} else if (evt === "ACTIVITY_UPDATE") {
				// This might be sent by Discord when activity changes via other means
				const result = SetActivityResponseSchema.safeParse(data);
				if (result.success) {
					this.emit(Events.ActivityUpdate, result.data);
				}
			}
		} else if (msg.opcode === OpCodes.CLOSE) {
			this.disconnect();
		}

		// Emit all raw messages for advanced usage
		this.emit("message" as any, msg);
	}
}