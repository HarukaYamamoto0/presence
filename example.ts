// noinspection ES6PreferShortImport

import {PresenceClient} from "./src/index.js"
import {setInterval} from "node:timers";
import {Events} from "./src/client/Events";

const client = new PresenceClient({
	clientId: "1445733433153425468"
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

await client.connect()

await client.setActivity({
	state: "Exploring the project",
	details: "Organizing the code...",
	assets: {
		large_image: "logo",
		large_text: "Presence Lib"
	}
});

await new Promise(resolve => setTimeout(resolve, 20000))

await client.disconnect()