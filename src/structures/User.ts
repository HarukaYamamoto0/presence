export interface User {
	id: string;
	username: string;
	discriminator: string;
	global_name?: string | null;
	avatar?: string | null;
	avatar_decoration_data?: {
		asset: string;
		sku_id?: string | null;
	} | null;
	bot: boolean;
	flags?: number | null;
	premium_type?: number | null;
}

export interface ReadyData {
	v: number;
	config: {
		cdn_host?: string;
		api_endpoint: string;
		environment: string;
	};
	user: User;
}
