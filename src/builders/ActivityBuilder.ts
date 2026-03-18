import {Activity, ActivityType, Assets, Button, Party, Secrets, Timestamps} from "../structures/Activity";

export class ActivityBuilder {
	private activity: Activity = {};

	setName(name: string): this {
		this.activity.name = name;
		return this;
	}

	setState(state: string): this {
		this.activity.state = state;
		return this;
	}

	setStateUrl(url: string): this {
		this.activity.state_url = url;
		return this;
	}

	setDetails(details: string): this {
		this.activity.details = details;
		return this;
	}

	setDetailsUrl(url: string): this {
		this.activity.details_url = url;
		return this;
	}

	setTimestamps(timestamps: Timestamps): this {
		this.activity.timestamps = timestamps;
		return this;
	}

	setStartTimestamp(start: number | Date): this {
		this.activity.timestamps = {
			...this.activity.timestamps,
			start: start instanceof Date ? start.getTime() : start
		};
		return this;
	}

	setEndTimestamp(end: number | Date): this {
		this.activity.timestamps = {
			...this.activity.timestamps,
			end: end instanceof Date ? end.getTime() : end
		};
		return this;
	}

	setParty(party: Party): this {
		this.activity.party = party;
		return this;
	}

	setAssets(assets: Assets): this {
		this.activity.assets = assets;
		return this;
	}

	setLargeImage(image: string, text?: string): this {
		this.activity.assets = {
			...this.activity.assets,
			large_image: image,
			large_text: text
		};
		return this;
	}

	setSmallImage(image: string, text?: string): this {
		this.activity.assets = {
			...this.activity.assets,
			small_image: image,
			small_text: text
		};
		return this;
	}

	setSecrets(secrets: Secrets): this {
		this.activity.secrets = secrets;
		return this;
	}

	addButton(button: Button): this {
		if (!this.activity.buttons) this.activity.buttons = [];
		this.activity.buttons.push(button);
		return this;
	}

	setType(type: ActivityType): this {
		this.activity.type = type;
		return this;
	}

	setInstance(instance: boolean): this {
		this.activity.instance = instance;
		return this;
	}

	build(): Activity {
		return {...this.activity};
	}
}
