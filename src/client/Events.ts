import {Activity} from "../structures/Activity";
import {ReadyData} from "../structures/User";

export enum Events {
	Ready = "ready",
	Error = "error",
	Disconnect = "disconnect",
	ActivityUpdate = "activityUpdate",
}

export interface EventPayloads {
	[Events.Ready]: ReadyData;
	[Events.Error]: any;
	[Events.Disconnect]: void;
	[Events.ActivityUpdate]: Activity;
}