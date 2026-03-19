import * as zod from 'zod';
import EventEmitter from "node:events"
import crypto from "node:crypto";
import {TransportFactory} from "../transports/TransportFactory";
import {
	ReadyEventSchema,
	ErrorEventSchema,
	SetActivityResponseSchema,
	Activity,
	ActivitySchema,
	ReadyData,
	OpCodes,
	RpcCommands,
	RpcEvents
} from "@dispipe/protocol";
import {encode} from "../protocols/encode";
import {Decoder} from "../protocols/Decoder";
import {Events, EventPayloads} from "./Events";
import {Transport} from "../types/transport";
import {Logger, createDefaultLogger, LogLevel} from "../utils/Logger";

/**
 * Options for the Rich Presence client.
 */
export interface ClientOptions {
	/** Application ID (Client ID) of your bot on Discord. */
	clientId: string;
	/** Custom transport implementation (optional). */
	transport?: Transport;
	/** Custom logger implementation (optional). */
	logger?: Logger;
	/** Log level for the default logger (optional). */
	logLevel?: LogLevel;
}

export declare interface PresenceClient {
	on<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;

	once<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;

	emit<E extends Events>(event: E, data: EventPayloads[E]): boolean;

	off<E extends Events>(event: E, listener: (data: EventPayloads[E]) => void): this;
}

/**
 * Main client for managing Rich Presence.
 *
 * @example
 * ```TypeScript
 * const client = new PresenceClient({
 *   clientId: '123456789012345678',
 *   logLevel: LogLevel.Debug
 * });
 *
 * client.on(Events.Ready, (data) => {
 *   console.log(`Logged in as ${data.user.username}`);
 * });
 *
 * await client.connect();
 * ```
 */
export class PresenceClient extends EventEmitter {
	private readonly clientId: string;
	private transport?: Transport;
	private readonly decoder = new Decoder();
	private _ready: boolean = false;
	private readonly logger: Logger;
	private pendingCommands = new Map<string, { resolve: (data: any) => void; reject: (err: Error) => void }>();

	constructor(options: ClientOptions) {
		super();
		this.clientId = options.clientId;
		this.logger = options.logger ?? createDefaultLogger(options.logLevel ?? LogLevel.Info);
		if (options.transport) {
			this.transport = options.transport;
		}
	}

	/**
	 * Indicates whether the client is connected and ready for use.
	 */
	get isReady(): boolean {
		return this._ready;
	}

	/**
	 * Connects the client to Discord's IPC.
	 * @throws Error if the client is already connected or if no Discord instance is found.
	 * @returns A promise that resolves to the client once it's ready.
	 */
	async connect(): Promise<this> {
		if (this._ready) {
			throw new Error("Client is already connected.");
		}

		this.emit(Events.Connecting, undefined as any);
		this.logger.info("Connecting to Discord...");

		if (!this.transport) {
			this.transport = await TransportFactory.createDefault(this.logger);
		}

		this.transport.onData((chunk) => {
			this.emit(Events.Debug, `Received ${chunk.length} bytes`);
			const messages = this.decoder.push(chunk);
			for (const msg of messages) {
				this.handleMessage(msg);
			}
		});

		this.transport.onClose(() => {
			this.logger.warn("Transport connection closed");
			this.disconnect();
		});

		this.emit(Events.Connected, undefined as any);
		await this.sendHandshake();

		return new Promise((resolve, reject) => {
			const onReady = (data: ReadyData) => {
				this.off(Events.Disconnect, onDisconnect);
				this.logger.info(`Connected as ${data.user.username}#${data.user.discriminator}`);
				resolve(this);
			};
			const onDisconnect = () => {
				this.off(Events.Ready, onReady as any);
				this.logger.error("Connection failed or closed before ready");
				reject(new Error("Connection closed before ready."));
			};

			this.once(Events.Ready, onReady as any);
			this.once(Events.Disconnect, onDisconnect);
		});
	}

	/**
	 * Sets the user's Rich Presence activity.
	 * @param activity The activity to set.
	 * @param pid The process ID (defaults to the current process).
	 * @returns A promise that resolves to the updated activity.
	 *
	 * @example
	 * ```TypeScript
	 * await client.setActivity({
	 *   state: 'Playing with my friends',
	 *   details: 'In a competitive match',
	 *   assets: {
	 *     large_image: 'map_de_dust2',
	 *     large_text: 'Dust II'
	 *   }
	 * });
	 * ```
	 */
	async setActivity(activity: Activity, pid: number = process.pid): Promise<Activity> {
		if (!this._ready || !this.transport) {
			throw new Error("Client is not ready. Call connect() first.");
		}

		const validatedActivity = ActivitySchema.parse(activity);

		const response = await this.sendCommand(RpcCommands.SET_ACTIVITY, {
			pid,
			activity: validatedActivity
		}, SetActivityResponseSchema);

		this.emit(Events.ActivityUpdate, response);

		return response;
	}

	/**
	 * Sends a command to Discord and waits for the response.
	 * @param cmd The command to send.
	 * @param args The arguments for the command.
	 * @param schema Optional Zod schema to validate the response.
	 * @returns A promise that resolves to the response data.
	 * @internal
	 */
	async sendCommand<T>(cmd: string, args: any, schema?: zod.ZodSchema<T>): Promise<T> {
		if (!this.transport) throw new Error("Transport not connected");

		const nonce = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
		this.logger.debug(`Sending command ${cmd}`, {args, nonce});

		return new Promise((resolve, reject) => {
			this.pendingCommands.set(nonce, {
				resolve: (data) => {
					this.logger.debug(`Received response for ${cmd}`, {nonce});
					if (!schema) return resolve(data as T);
					const result = schema.safeParse(data);
					if (result.success) {
						resolve(result.data);
					} else {
						const error = new Error(`Invalid response for ${cmd}: ${result.error.message}`);
						this.logger.error(error.message);
						reject(error);
					}
				},
				reject: (err) => {
					this.logger.error(`Command ${cmd} failed`, {nonce, error: err.message});
					reject(err);
				}
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
	 * @returns A promise that resolves when reconnection is complete.
	 */
	async reconnect(): Promise<void> {
		await this.disconnect();
		await this.connect();
	}

	/**
	 * Disconnects the client from Discord.
	 * @returns A promise that resolves when disconnection is complete.
	 */
	async disconnect(): Promise<void> {
		if (!this.transport && !this._ready) return;

		this.logger.info("Disconnecting...");
		if (this.transport) {
			this.transport.close();
			this.transport = undefined;
		}

		this._ready = false;
		this.emit(Events.Disconnect, undefined as any);
	}

	/**
	 * Sends the initial handshake to Discord.
	 * @internal
	 */
	async sendHandshake(): Promise<void> {
		if (!this.transport) return;

		this.logger.debug("Sending handshake...");
		this.transport.write(
			encode(OpCodes.HANDSHAKE, {
				v: 1,
				client_id: this.clientId
			})
		);
	}

	private handleMessage(msg: { opcode: OpCodes; data: any }) {
		this.emit(Events.Raw, msg);
		this.logger.trace?.("Received message", msg);

		if (msg.opcode === OpCodes.FRAME) {
			const {evt, data, nonce} = msg.data || {};

			if (nonce && this.pendingCommands.has(nonce)) {
				const {resolve, reject} = this.pendingCommands.get(nonce)!;
				this.pendingCommands.delete(nonce);

				if (evt === RpcEvents.ERROR) {
					const result = ErrorEventSchema.safeParse(data);
					const error = new Error(result.success ? result.data.message : "Discord error");
					this.logger.error("Discord error response", {nonce, message: error.message});
					reject(error);
					return;
				}
				resolve(data);
				return;
			}

			if (evt === RpcEvents.READY) {
				const result = ReadyEventSchema.safeParse(data);
				if (result.success) {
					this._ready = true;
					this.emit(Events.Ready, result.data);
				} else {
					const error = new Error("Invalid READY payload: " + result.error.message);
					this.logger.error(error.message);
					this.emit(Events.Error, error);
				}
			} else if (evt === RpcEvents.ERROR) {
				const result = ErrorEventSchema.safeParse(data);
				const error = new Error(result.success ? result.data.message : "Unknown Discord error");
				this.logger.error(error.message);
				this.emit(Events.Error, error);
			} else if (evt === RpcEvents.ACTIVITY_UPDATE) {
				this.logger.info("Activity updated from Discord (dispatch)");
				const result = SetActivityResponseSchema.safeParse(data);
				if (result.success) {
					this.emit(Events.ActivityUpdate, result.data);
				}
			} else if (evt === RpcEvents.ACTIVITY_JOIN) {
				this.emit(Events.ActivityJoin, data);
			} else if (evt === RpcEvents.ACTIVITY_SPECTATE) {
				this.emit(Events.ActivitySpectate, data);
			} else if (evt === RpcEvents.ACTIVITY_JOIN_REQUEST) {
				this.emit(Events.ActivityJoinRequest, data);
			}
		} else if (msg.opcode === OpCodes.CLOSE) {
			this.logger.warn("Received CLOSE opcode from Discord");
			this.disconnect();
		}
	}
}