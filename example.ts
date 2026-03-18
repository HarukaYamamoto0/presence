// noinspection ES6PreferShortImport

import {PresenceClient, Events, ActivityBuilder} from "./src/index.js"

const client = new PresenceClient({
	clientId: "1445733433153425468"
})

client.on(Events.Ready, (data) => {
	console.log("> Successfully connected ✅")
	console.log(`> Logged in as ${data.user.username}#${data.user.discriminator} (${data.user.id})`)
})

client.on(Events.ActivityUpdate, (activity) => {
	console.log("> Activity updated:", activity.details)
})

client.on(Events.Error, (error) => {
	console.log("> Error found: ❌" + error)
})

client.on(Events.Disconnect, () => {
	console.log("> Disconnect successfully ✅")
})

await client.connect()

const activity = new ActivityBuilder()
	.setState("Exploring the project")
	.setDetails("Organizing the code...")
	.setLargeImage("logo", "Presence Lib")
	.setStartTimestamp(new Date())
	.build();

await client.setActivity(activity);

await new Promise(resolve => setTimeout(resolve, 20000))

await client.disconnect()