import {Activity, ReadyData} from "@dispipe/protocol";

/**
 * Internal events emitted by PresenceClient for the end user.
 */
export enum Events {
	/** Emitted when the connection with Discord is established and the handshake is completed. */
	Ready = "ready",
	/** Emitted when an error occurs in connection or processing. */
	Error = "error",
	/** Emitted when the connection is lost. */
	Disconnect = "disconnect",
	/** Emitted when the activity (Rich Presence) is successfully updated. */
	ActivityUpdate = "activityUpdate",
	/** Emitted for technical debugging logs. */
	Debug = "debug",
	/** Emitted for every raw payload received from Discord. */
	Raw = "raw",
	/** Emitted when the client starts a connection attempt. */
	Connecting = "connecting",
	/** Emitted when the low-level transport is connected. */
	Connected = "connected",
	/** Emitted when a user clicks the "Join" button on an invitation. */
	ActivityJoin = "activityJoin",
	/** Emitted when a user clicks the "Spectate" button on an invitation. */
	ActivitySpectate = "activitySpectate",
	/** Emitted when someone requests to join your activity. */
	ActivityJoinRequest = "activityJoinRequest",
}

export interface EventPayloads {
	[Events.Ready]: ReadyData;
	[Events.Error]: Error | any;
	[Events.Disconnect]: void;
	[Events.ActivityUpdate]: Activity;
	[Events.Debug]: string;
	[Events.Raw]: { opcode: number; data: any };
	[Events.Connecting]: void;
	[Events.Connected]: void;
	[Events.ActivityJoin]: { secret: string };
	[Events.ActivitySpectate]: { secret: string };
	[Events.ActivityJoinRequest]: { user: any };
}