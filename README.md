# sdas

```TypeScript
import {ClientRP, LogLevel, Events} from "@harukadev/presence"

const clientRP = new ClientRP({
	clientId: "280984871685062656",
	logger: LogLevel.All
})

client.on(Events.Ready, () => {
	console.log("> Successfully connected ✅")
})

client.on(Events.Error, (error) => {
	console.log("> Error found: ❌" + error)
})

client.on(Events.Disconnect, () => {
	console.log("> Disconnect successfully ✅")
})

client.connect() // try connecting to the current instance of Discord

const presence = new Presence({
	name: "string",
	state: "string",
	details: "string",
	details_url: "string",
	timestamps: "Timestamps",
	party: "Party",
	assets: "Assets",
	secrets: "Secrets",
	buttons: "Button[]",
	type: "ActivityType",
	status_display_type: "StatusDisplayType",
})

await client.updatePresence(presence) // before sending, it checks if there is an active connection

client.disconnect() // close the connection to Discord
```