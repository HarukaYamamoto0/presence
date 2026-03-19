import * as zod from 'zod';
import {UserSchema} from "../schema/common";
import {ReadyEventSchema} from "../schema/events";

export type User = zod.infer<typeof UserSchema>;
export type ReadyData = zod.infer<typeof ReadyEventSchema>;
