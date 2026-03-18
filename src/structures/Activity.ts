export interface Activity {
	name?: string;
	state?: string;
	state_url?: string;
	details?: string;
	details_url?: string;
	timestamps?: Timestamps;
	party?: Party;
	assets?: Assets;
	secrets?: Secrets;
	buttons?: Button[];
	type?: ActivityType;
	status_display_type?: StatusDisplayType;
}

export interface Timestamps {
	start?: number; // i64 -> number (ms)
	end?: number;
}

export interface Party {
	id?: string;
	size?: [number, number]; // [current, max]
}

export interface Assets {
	large_image?: string;
	large_text?: string;
	large_url?: string;
	small_image?: string;
	small_text?: string;
	small_url?: string;
}

export interface Secrets {
	join?: string;
	spectate?: string;
	match?: string;
}

export interface Button {
	label: string;
	url: string;
}

export enum ActivityType {
	Playing = 0,
	Listening = 2,
	Watching = 3,
	Competing = 5,
}

export enum StatusDisplayType {
	Name = 0,
	State = 1,
	Details = 2,
}