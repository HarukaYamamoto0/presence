import * as zod from 'zod';
import {ActivitySchema} from './common';

export const SetActivityInputSchema = zod.object({
	pid: zod.number(),
	activity: ActivitySchema.nullable(),
});

export const SetActivityResponseSchema = ActivitySchema;
