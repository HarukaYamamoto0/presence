import EventEmitter from "node:events";
import { TransportFactory } from "../transports/TransportFactory";
import { OPCODE } from "../protocols/opcodes";
import { encode } from "../protocols/encode";
import { Decoder } from "../protocols/Decoder";
import { Events } from "./Events";
/**
 * The main client for managing Rich Presence.
 */
export class ClientRP extends EventEmitter {
    clientId;
    transport;
    decoder = new Decoder();
    _ready = false;
    constructor(options) {
        super();
        this.clientId = options.clientId;
        if (options.transport) {
            this.transport = options.transport;
        }
    }
    /**
     * Indicates if the client is currently connected and ready.
     */
    get isReady() {
        return this._ready;
    }
    /**
     * Connects the client to the Discord IPC socket.
     * @throws Error if the client is already connected or no Discord instance is found.
     */
    async connect() {
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
    async setActivity(activity, pid = process.pid) {
        if (!this._ready || !this.transport) {
            throw new Error("Client is not ready. Call connect() first.");
        }
        const nonce = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        this.transport.write(encode(OPCODE.FRAME, {
            cmd: "SET_ACTIVITY",
            args: {
                pid,
                activity
            },
            nonce
        }));
    }
    /**
     * Disconnects and reconnects the client.
     */
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }
    /**
     * Disconnects the client from Discord.
     */
    async disconnect() {
        if (!this.transport && !this._ready)
            return;
        if (this.transport) {
            this.transport.close();
            this.transport = undefined;
        }
        this._ready = false;
        this.emit(Events.Disconnect);
    }
    async sendHandshake() {
        if (!this.transport)
            return;
        this.transport.write(encode(OPCODE.HANDSHAKE, {
            v: 1,
            client_id: this.clientId
        }));
    }
    handleMessage(msg) {
        if (msg.opcode === OPCODE.FRAME) {
            const { evt, data } = msg.data || {};
            if (evt === "READY") {
                this._ready = true;
                this.emit(Events.Ready, data);
            }
        }
        else if (msg.opcode === OPCODE.CLOSE) {
            this.disconnect();
        }
        // Emit all raw messages for advanced usage
        this.emit("message", msg);
    }
}
