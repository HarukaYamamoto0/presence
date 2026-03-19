import * as zod from 'zod';
import {UserSchema} from './common';

export const ReadyEventSchema = zod.object({
	v: zod.number(),
	config: zod.object({
		cdn_host: zod.string().optional(),
		api_endpoint: zod.string(),
		environment: zod.string(),
	}),
	user: UserSchema,
});

export const ErrorEventSchema = zod.object({
	code: zod.number(),
	message: zod.string().optional(),
});
