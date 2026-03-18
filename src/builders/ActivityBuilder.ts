import {Activity, ActivityType, Assets, Button, Party, Secrets, Timestamps} from "../structures/Activity";

/**
 * Fluent builder for creating Discord Rich Presence activities.
 *
 * @example
 * ```typescript
 * const activity = new ActivityBuilder()
 *   .setName('My Awesome App')
 *   .setDetails('Developing...')
 *   .setState('In Beta')
 *   .setLargeImage('logo', 'App Logo')
 *   .setStartTimestamp(new Date())
 *   .addButton({ label: 'Visit Website', url: 'https://example.com' })
 *   .build();
 * ```
 */
export class ActivityBuilder {
	private activity: Activity = {};

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
	 * @param timestamps Timestamps object.
	 */
	setTimestamps(timestamps: Timestamps): this {
		this.activity.timestamps = timestamps;
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
	 * @param party Party object.
	 */
	setParty(party: Party): this {
		this.activity.party = party;
		return this;
	}

	/**
	 * Sets the assets for the activity.
	 * @param assets Assets object.
	 */
	setAssets(assets: Assets): this {
		this.activity.assets = assets;
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
	 * @param secrets Secrets object.
	 */
	setSecrets(secrets: Secrets): this {
		this.activity.secrets = secrets;
		return this;
	}

	/**
	 * Adds a button to the activity.
	 * @param button Button object.
	 */
	addButton(button: Button): this {
		if (!this.activity.buttons) this.activity.buttons = [];
		this.activity.buttons.push(button);
		return this;
	}

	/**
	 * Sets the activity type.
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
	 * Builds the final activity object.
	 * @returns The constructed Activity object.
	 */
	build(): Activity {
		return {...this.activity};
	}
}
