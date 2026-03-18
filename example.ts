// noinspection ES6PreferShortImport

import {PresenceClient, Events, ActivityBuilder, LogLevel} from "./src/index.js"

const client = new PresenceClient({
	clientId: "1445733433153425468",
	logLevel: LogLevel.Trace
})

client.on(Events.Connecting, () => {
	console.log("> Connecting to Discord...")
})

client.on(Events.Connected, () => {
	console.log("> Connected to transport ✅")
})

client.on(Events.Ready, (data) => {
	console.log("> Successfully connected ✅")
	console.log(`> Logged in as ${data.user.username}#${data.user.discriminator} (${data.user.id})`)
})

client.on(Events.ActivityUpdate, (activity) => {
	console.log("> Activity updated:", JSON.stringify(activity, null, 2))
})

client.on(Events.Error, (error) => {
	console.log("> Error found: ❌" + error)
})

client.on(Events.Disconnect, () => {
	console.log("> Disconnect successfully ✅")
})

await client.connect()

const activity = new ActivityBuilder()
	.setName('My Awesome App')
	.setDetails('Developing...')
	.setState('In Beta')
	.setLargeImage('https://i.pinimg.com/736x/6c/7f/16/6c7f163f16a052de2222f9e20f69f4ce.jpg', 'App Logo')
	.setStartTimestamp(new Date())
	// .addButton({
	// 	label: "youtube",
	// 	url: "https://www.youtube.com"
	// })
	.build();

await client.setActivity(activity);

await new Promise(resolve => setTimeout(resolve, 20000))

await client.disconnect()