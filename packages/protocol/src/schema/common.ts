import * as zod from 'zod';
import {ActivityType} from "../structures/Activity";

export const UserSchema = zod.object({
	id: zod.string(),
	username: zod.string(),
	discriminator: zod.string(),
	global_name: zod.string().nullable().optional(),
	avatar: zod.string().nullable().optional(),
	avatar_decoration_data: zod
		.object({
			asset: zod.string(),
			sku_id: zod.string().nullable().optional(),
		})
		.nullable()
		.optional(),
	bot: zod.boolean().optional(),
	flags: zod.int().nullable().optional(),
	premium_type: zod.int().nullable().optional(),
});

export const ActivityTypeSchema = zod.enum(ActivityType);

export const TimestampsSchema = zod.object({
	start: zod.int().optional(),
	end: zod.int().optional(),
});

export const PartySchema = zod.object({
	id: zod.string().optional(),
	size: zod.array(zod.int()).length(2).optional(),
});

const imageExtensionRegex = /\.(png|jpe?g)(\?.*)?$/i;

export const AssetsSchema = zod.object({
	/**
	 * Large image key or URL. Only supports png, jpg, and jpeg formats.
	 */
	large_image: zod.string()
		.max(256)
		.refine(val => {
			if (!val || !val.startsWith('http')) return true;
			return imageExtensionRegex.test(val);
		}, {
			message: 'Image URL must end with .png, .jpg or .jpeg'
		})
		.nullable()
		.optional(),
	large_text: zod.string().max(128).nullable().optional(),
	large_url: zod.url().max(512).nullable().optional(),
	/**
	 * Small image key or URL. Only supports png, jpg, and jpeg formats.
	 */
	small_image: zod.string()
		.max(256)
		.refine(val => {
			if (!val || !val.startsWith('http')) return true;
			return imageExtensionRegex.test(val);
		}, {
			message: 'Image URL must end with .png, .jpg or .jpeg'
		})
		.nullable()
		.optional(),
	small_text: zod.string().max(128).nullable().optional(),
	small_url: zod.url().max(512).nullable().optional(),
});

export const SecretsSchema = zod.object({
	join: zod.string().max(128).optional(),
	spectate: zod.string().max(128).optional(),
	match: zod.string().max(128).optional(),
});

export const ButtonSchema = zod.union([
	zod.object({
		label: zod.string().min(1).max(32),
		url: zod.url().max(512),
	}),
	zod.string().max(32),
]);

export const ActivitySchema = zod.object({
	name: zod.string().min(1).max(128),
	application_id: zod.string().nullable().optional(),
	state: zod.string().max(128).nullable().optional(),
	state_url: zod.url().max(512).nullable().optional(),
	details: zod.string().max(128).nullable().optional(),
	details_url: zod.url().max(512).nullable().optional(),
	timestamps: TimestampsSchema.nullable().optional(),
	party: PartySchema.nullable().optional(),
	assets: AssetsSchema.nullable().optional(),
	secrets: SecretsSchema.nullable().optional(),
	buttons: zod.array(ButtonSchema).max(2).nullable().optional(),
	/**
	 * When using SET_ACTIVITY, the activity object is limited to a type of
	 * Playing (0), Listening (2), Watching (3), or Competing (5).
	 */
	type: zod.union([
		zod.literal(ActivityType.Playing),
		zod.literal(ActivityType.Listening),
		zod.literal(ActivityType.Watching),
		zod.literal(ActivityType.Competing),
	]).optional().default(ActivityType.Playing),
	instance: zod.boolean().nullable().optional(),
	flags: zod.int().nullable().optional(),
	created_at: zod.int().nullable().optional(),
});
