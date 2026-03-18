import * as zod from 'zod';
import {ActivityType} from "../structures/Activity";

export const UserSchema = zod.object({
	id: zod.string(),
	username: zod.string(),
	discriminator: zod.string(),
	global_name: zod.string().optional().nullable(),
	avatar: zod.string().optional().nullable(),
	avatar_decoration_data: zod
		.object({
			asset: zod.string(),
			sku_id: zod.string().optional().nullable(),
		})
		.nullable()
		.optional(),
	bot: zod.boolean().optional(),
	flags: zod.number().optional().nullable(),
	premium_type: zod.number().optional().nullable(),
});

export const ActivityTypeSchema = zod.nativeEnum(ActivityType);

export const TimestampsSchema = zod.object({
	start: zod.number().optional(),
	end: zod.number().optional(),
}).partial().optional().nullable();

export const PartySchema = zod.object({
	id: zod.string().optional(),
	size: zod.tuple([zod.number(), zod.number()]).optional(),
}).partial().optional().nullable();

export const AssetsSchema = zod.object({
	large_image: zod.string().optional().nullable(),
	large_text: zod.string().optional().nullable(),
	large_url: zod.string().optional().nullable(),
	small_image: zod.string().optional().nullable(),
	small_text: zod.string().optional().nullable(),
	small_url: zod.string().optional().nullable(),
}).partial().optional().nullable();

export const SecretsSchema = zod.object({
	join: zod.string().optional(),
	spectate: zod.string().optional(),
	match: zod.string().optional(),
}).partial().optional().nullable();

export const ButtonSchema = zod.object({
	label: zod.string(),
	url: zod.string(),
});

export const ActivitySchema = zod.object({
	name: zod.string().optional(),
	state: zod.string().optional().nullable(),
	state_url: zod.string().url().optional().nullable(),
	details: zod.string().optional().nullable(),
	details_url: zod.string().url().optional().nullable(),
	timestamps: TimestampsSchema,
	party: PartySchema,
	assets: AssetsSchema,
	secrets: SecretsSchema,
	buttons: zod.array(ButtonSchema).max(2).optional().nullable(),
	type: ActivityTypeSchema.optional(),
	instance: zod.boolean().optional().nullable(),
	flags: zod.number().optional().nullable(),
});
