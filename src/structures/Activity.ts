import * as zod from 'zod';
import {ActivitySchema, ActivityTypeSchema, AssetsSchema, ButtonSchema, PartySchema, SecretsSchema, TimestampsSchema} from "../schema/common";

export type Activity = zod.infer<typeof ActivitySchema>;
export type Timestamps = zod.infer<typeof TimestampsSchema>;
export type Party = zod.infer<typeof PartySchema>;
export type Assets = zod.infer<typeof AssetsSchema>;
export type Secrets = zod.infer<typeof SecretsSchema>;
export type Button = zod.infer<typeof ButtonSchema>;

export enum ActivityType {
	Playing = 0,
	Streaming = 1,
	Listening = 2,
	Watching = 3,
	Custom = 4,
	Competing = 5,
}