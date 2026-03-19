export enum OpCodes {
	HANDSHAKE = 0,
	FRAME = 1,
	CLOSE = 2,
	HELLO = 3
}

export const RpcCommands = {
	DISPATCH: 'DISPATCH',
	SET_ACTIVITY: 'SET_ACTIVITY',
} as const;

export type RPCCommand = keyof typeof RpcCommands;

export const RpcEvents = {
	READY: 'READY',
	ERROR: 'ERROR',
	ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
	ACTIVITY_JOIN: 'ACTIVITY_JOIN',
	ACTIVITY_SPECTATE: 'ACTIVITY_SPECTATE',
	ACTIVITY_JOIN_REQUEST: 'ACTIVITY_JOIN_REQUEST',
} as const;

export type RPCEvent = keyof typeof RpcEvents;

export enum ActivityType {
	Playing = 0,
	Listening = 2,
	Watching = 3,
	Competing = 5,
}