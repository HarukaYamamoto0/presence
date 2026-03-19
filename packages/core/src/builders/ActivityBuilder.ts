import {
	Activity,
	ActivityType,
	Assets,
	Button,
	Party,
	Secrets,
	Timestamps,
	AssetsBuilder,
	ButtonBuilder,
	PartyBuilder,
	SecretsBuilder,
	TimestampsBuilder,
	ActivitySchema,
	TimestampsSchema,
	PartySchema,
	AssetsSchema,
	SecretsSchema,
	ButtonSchema
} from "@dispipe/protocol";

/**
 * Fluent builder for creating Discord Rich Presence activities.
 */
export class ActivityBuilder {
	private activity: any = {};

	/**
	 * Sets the name of the activity.
	 * @param name The name of the activity.
	 */
	setName(name: string): this {
		this.activity.name = name;
		return this;
	}

	/**
	 * Sets the state of the activity.
	 * @param state The state of the activity (e.g. "In a party").
	 */
	setState(state: string): this {
		this.activity.state = state;
		return this;
	}

	/**
	 * Sets the state URL of the activity.
	 * @param url The URL for the state.
	 */
	setStateUrl(url: string): this {
		this.activity.state_url = url;
		return this;
	}

	/**
	 * Sets the details of the activity.
	 * @param details What the user is currently doing (e.g. "Competitive Match").
	 */
	setDetails(details: string): this {
		this.activity.details = details;
		return this;
	}

	/**
	 * Sets the details URL of the activity.
	 * @param url The URL for the details.
	 */
	setDetailsUrl(url: string): this {
		this.activity.details_url = url;
		return this;
	}

	/**
	 * Sets the timestamps for the activity.
	 * @param timestamps Timestamps object or builder.
	 */
	setTimestamps(timestamps: Timestamps | TimestampsBuilder): this {
		this.activity.timestamps = timestamps instanceof TimestampsBuilder ? timestamps.toJSON() : TimestampsSchema.parse(timestamps);
		return this;
	}

	/**
	 * Sets the start timestamp of the activity.
	 * @param start Unix timestamp in milliseconds or Date object.
	 */
	setStartTimestamp(start: number | Date): this {
		this.activity.timestamps = {
			...this.activity.timestamps,
			start: start instanceof Date ? start.getTime() : start
		};
		return this;
	}

	/**
	 * Sets the end timestamp of the activity.
	 * @param end Unix timestamp in milliseconds or Date object.
	 */
	setEndTimestamp(end: number | Date): this {
		this.activity.timestamps = {
			...this.activity.timestamps,
			end: end instanceof Date ? end.getTime() : end
		};
		return this;
	}

	/**
	 * Sets the party information for the activity.
	 * @param party Party object or builder.
	 */
	setParty(party: Party | PartyBuilder): this {
		this.activity.party = party instanceof PartyBuilder ? party.toJSON() : PartySchema.parse(party);
		return this;
	}

	/**
	 * Sets the assets for the activity.
	 * @param assets Assets object or builder.
	 */
	setAssets(assets: Assets | AssetsBuilder): this {
		this.activity.assets = assets instanceof AssetsBuilder ? assets.toJSON() : AssetsSchema.parse(assets);
		return this;
	}

	/**
	 * Sets the large image and optional text for the activity.
	 * @param image Image key or URL.
	 * @param text Hover text for the image.
	 */
	setLargeImage(image: string, text?: string): this {
		this.activity.assets = {
			...this.activity.assets,
			large_image: image,
			large_text: text
		};
		return this;
	}

	/**
	 * Sets the small image and optional text for the activity.
	 * @param image Image key or URL.
	 * @param text Hover text for the image.
	 */
	setSmallImage(image: string, text?: string): this {
		this.activity.assets = {
			...this.activity.assets,
			small_image: image,
			small_text: text
		};
		return this;
	}

	/**
	 * Sets the secrets for joining and spectating.
	 * @param secrets Secrets object or builder.
	 */
	setSecrets(secrets: Secrets | SecretsBuilder): this {
		this.activity.secrets = secrets instanceof SecretsBuilder ? secrets.toJSON() : SecretsSchema.parse(secrets);
		return this;
	}

	/**
	 * Adds a button to the activity.
	 * @param button Button object or builder.
	 */
	addButton(button: Button | ButtonBuilder): this {
		if (!this.activity.buttons) this.activity.buttons = [];
		const buttonObj = button instanceof ButtonBuilder ? button.toJSON() : ButtonSchema.parse(button);
		this.activity.buttons.push(buttonObj);
		return this;
	}

	/**
	 * Sets the activity type.
	 * 
	 * Note: For Rich Presence via RPC, only Playing (0), Listening (2), 
	 * Watching (3), and Competing (5) are supported.
	 * 
	 * @param type ActivityType enum value.
	 */
	setType(type: ActivityType): this {
		this.activity.type = type;
		return this;
	}

	/**
	 * Sets whether the activity is an instanced game session.
	 * @param instance Boolean value.
	 */
	setInstance(instance: boolean): this {
		this.activity.instance = instance;
		return this;
	}

	/**
	 * Validates and returns the final activity object.
	 * @throws Error if the activity name is not set.
	 * @returns The constructed Activity object.
	 */
	toJSON(): Activity {
		if (!this.activity.name) {
			throw new Error('ActivityBuilder requires name to be set.');
		}
		return ActivitySchema.parse(this.activity) as Activity;
	}

	/**
	 * Builds the final activity object.
	 * Alias for toJSON().
	 * @returns The constructed Activity object.
	 */
	build(): Activity {
		return this.toJSON();
	}
}
