import {Activity} from "../structures/Activity";
import {ReadyData} from "../structures/User";

export enum Events {
	Ready = "ready",
	Error = "error",
	Disconnect = "disconnect",
	ActivityUpdate = "activityUpdate",
	Debug = "debug",
	Raw = "raw",
	Connecting = "connecting",
	Connected = "connected",
	ActivityJoin = "activityJoin",
	ActivitySpectate = "activitySpectate",
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