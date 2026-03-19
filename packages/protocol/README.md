# @dispipe/protocol

[![npm version](https://img.shields.io/npm/v/@dispipe/protocol.svg)](https://www.npmjs.com/package/@dispipe/protocol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The shared protocol definitions for the Dispipe ecosystem, providing Zod schemas and TypeScript types for Discord RPC commands and events.

## 🚀 Installation

```bash
bun add @dispipe/protocol
# or
npm install @dispipe/protocol
```

## 📝 Features

- **Zod Schemas:** Complete validation for Discord RPC structures (`Activity`, `User`, `ReadyData`, etc.).
- **TypeScript Definitions:** Infered types with `DeepPrettify` for a clean developer experience.
- **Constants:** Centralized enums for `OpCodes`, `RpcCommands`, `RpcEvents`, and `ActivityType`.
- **Validation Builders:** Small builders for partial structures like `AssetsBuilder`, `ButtonBuilder`, etc., with internal validation.

## 🛠️ Usage Example (Manual Validation)

While usually consumed by `@dispipe/presence`, you can use the schemas for manual validation:

```typescript
import { ActivitySchema, AssetsSchema } from "@dispipe/protocol";

// Validate a raw object
const result = ActivitySchema.safeParse({
    name: "My Game",
    assets: {
        large_image: "logo",
        large_text: "My Game Logo"
    }
});

if (result.success) {
    console.log("Valid Activity Data:", result.data);
} else {
    console.error("Invalid Activity Data:", result.error.errors);
}
```

## 🏗️ Structure

- `src/schema/`: Zod validation schemas.
- `src/structures/`: TypeScript interfaces and types.
- `src/constants.ts`: Protocol constants and enums.
- `src/builders/`: Modular validation-aware builders.

## 📄 License

MIT © HarukaYamamoto0
