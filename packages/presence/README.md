# @dispipe/presence

[![npm version](https://img.shields.io/npm/v/@dispipe/presence.svg)](https://www.npmjs.com/package/@dispipe/presence)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The core client for Discord Rich Presence, featuring a fluent builder API and robust multi-platform transport.

## 🚀 Installation

```bash
bun add @dispipe/presence
# or
npm install @dispipe/presence
```

## 📝 Basic Usage

```typescript
import { PresenceClient, Events, ActivityBuilder, LogLevel } from "@dispipe/presence";

const client = new PresenceClient({
    clientId: "YOUR_APPLICATION_ID",
    logLevel: LogLevel.Info
});

client.on(Events.Ready, (data) => {
    console.log(`Connected as ${data.user.username}`);
});

await client.connect();

const activity = new ActivityBuilder()
    .setName('Developing Presence')
    .setDetails('Using Dispipe')
    .setStartTimestamp(new Date())
    .build();

await client.setActivity(activity);
```

## 🏗️ Advanced Activity Building

The `ActivityBuilder` allows you to create complex presences with ease:

```typescript
import { 
    ActivityBuilder, 
    AssetsBuilder, 
    ButtonBuilder, 
    TimestampsBuilder, 
    PartyBuilder,
    ActivityType 
} from "@dispipe/presence";

const activity = new ActivityBuilder()
    .setName('Dispipe SDK')
    .setDetails('Building Rich Presence')
    .setState('In a party')
    .setType(ActivityType.Competing)
    .setAssets(new AssetsBuilder()
        .setLargeImage('https://i.pinimg.com/736x/6c/7f/16/6c7f163f16a052de2222f9e20f69f4ce.jpg')
        .setLargeText('Dispipe Logo'))
    .setTimestamps(new TimestampsBuilder()
        .setStart(new Date()))
    .setParty(new PartyBuilder()
        .setId('party-id')
        .setSize(1, 4))
    .addButton(new ButtonBuilder()
        .setLabel('GitHub')
        .setUrl('https://github.com/HarukaYamamoto0/dispipe'))
    .build();

await client.setActivity(activity);
```

## 📡 Events

- `Events.Ready`: Client is logged in and ready.
- `Events.Connected`: Transport is connected.
- `Events.Disconnect`: Client disconnected.
- `Events.Error`: An error occurred.
- `Events.ActivityUpdate`: Presence was updated successfully.
- `Events.Debug`: Internal debug logs.

## 🛠️ Configuration

The `PresenceClient` constructor accepts:

- `clientId`: Your Discord Application ID.
- `logLevel`: (Optional) Choose from `Fatal`, `Error`, `Warn`, `Info`, `Debug`, `Trace`, `Silent`.
- `logger`: (Optional) Provide a custom `pino` logger or an implementation matching the `Logger` interface.

## 📄 License

MIT © HarukaYamamoto0
