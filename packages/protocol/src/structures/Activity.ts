import * as zod from 'zod';
import {ActivityType} from "../constants";
import {ActivitySchema, AssetsSchema, ButtonSchema, PartySchema, SecretsSchema, TimestampsSchema} from "../schema/common";

export type Activity = zod.infer<typeof ActivitySchema>;
export type Timestamps = zod.infer<typeof TimestampsSchema>;
export type Party = zod.infer<typeof PartySchema>;
export type Assets = zod.infer<typeof AssetsSchema>;
export type Secrets = zod.infer<typeof SecretsSchema>;
export type Button = zod.infer<typeof ButtonSchema>;

export {ActivityType};