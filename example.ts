// noinspection ES6PreferShortImport

import {
	PresenceClient,
	Events,
	ActivityBuilder,
	AssetsBuilder,
	ButtonBuilder,
	TimestampsBuilder,
	PartyBuilder,
	LogLevel,
	ActivityType
} from "./packages/presence/src/index"

/**
 * Example usage of @dispipe/presence
 * This demonstrates how to connect, listen to events, and set a complex activity.
 */

// 1. Initialize the client with your Discord Application ID
const client = new PresenceClient({
	clientId: "1445733433153425468", // Replace it with your actual Application ID
	logLevel: LogLevel.Debug       // Choose the desired log level
})

// 2. Set up event listeners BEFORE connecting
client.on(Events.Ready, (data) => {
	console.log('--- Client is Ready! ---');
	console.log(`Logged in as: ${data.user.username}#${data.user.discriminator}`);
});

client.on(Events.Connected, () => {
	console.log('Successfully connected to Discord transport!');
});

client.on(Events.ActivityUpdate, (activity) => {
	console.log('Presence updated:', activity?.name);
});

client.on(Events.Error, (error) => {
	console.error('An error occurred:', error.message);
});

client.on(Events.Debug, (message) => {
	// console.log(`[DEBUG] ${message}`);
});

try {
	// 3. Connect to Discord (tries IPC first, then WebSocket fallback)
	await client.connect();

	// 4. Build a complex Activity using the fluent API
	const activity = new ActivityBuilder()
		.setName('Dispipe Rich Presence')
		.setDetails('Developing with Bun & TypeScript')
		.setState('Exploring the Monorepo')
		.setType(ActivityType.Competing) // 0: Playing, 1: Streaming, 2: Listening, 3: Watching, 5: Competing

		// Configure Rich Presence Assets (Images and Tooltips)
		.setAssets(new AssetsBuilder()
			.setLargeImage('https://i.pinimg.com/736x/6c/7f/16/6c7f163f16a052de2222f9e20f69f4ce.jpg')
			.setLargeText('Dispipe Library')
			.setSmallImage('https://github.com/HarukaYamamoto0.png')
			.setSmallText('Powered by Bun'))

		// Configure Time (Start and/or End timestamps)
		.setTimestamps(new TimestampsBuilder()
			.setStart(new Date()) // Shows "elapsed" time
			.setEnd(new Date(Date.now() + 60 * 60 * 1000))) // Shows "remaining" time

		// Configure Party (Group/Lobby information)
		.setParty(new PartyBuilder()
			.setId('my-awesome-party-id')
			.setSize(1, 5)) // 1 out of 5 slots filled

		// Add Interactive Buttons (Max 2)
		.addButton(new ButtonBuilder()
			.setLabel('GitHub Repository')
			.setUrl('https://github.com/HarukaYamamoto0/dispipe'))
		.addButton(new ButtonBuilder()
			.setLabel('Join Discord')
			.setUrl('https://discord.gg/example'))

		// Build the final validated object
		.build();

	// 5. Send the activity to Discord
	console.log('Updating activity...');
	await client.setActivity(activity);

	// 6. Keep the process alive to see the result
	console.log('Presence active for 30 seconds. Press Ctrl+C to exit.');
	await new Promise(resolve => setTimeout(resolve, 30_000));

} catch (error) {
	console.error('Failed to run example:', error);
} finally {
	// 7. Cleanup and disconnect
	await client.disconnect();
	process.exit(0);
}