# Dispipe Monorepo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

A modular and robust Discord Rich Presence ecosystem for JavaScript/TypeScript.

## 📦 Packages

This monorepo contains the following packages:

- **[@dispipe/presence](./packages/core)**: The main Rich Presence client with IPC/WebSocket support and fluent builder API.
- **[@dispipe/protocol](./packages/protocol)**: The shared source of truth for Discord RPC schemas (Zod), constants, and TypeScript definitions.

## 🚀 Key Features

- **Multi-platform Transport:** Automatic discovery and connection via IPC (Unix/Windows) with WebSocket fallback.
- **Strong Validation:** Full Zod validation for all RPC commands and events, ensuring protocol compliance.
- **Fluent API:** Clean, chaining builders for Activities, Assets, Buttons, and more.
- **Structured Logging:** High-performance logging using [pino](https://github.com/pinojs/pino) with customizable levels.

## 🛠️ Getting Started (Monorepo Development)

This project uses [Bun](https://bun.sh) for managing dependencies and workspaces.

### Prerequisites

- [Bun](https://bun.sh/docs/installation) (v1.0.0 or higher)

### Installation

```bash
bun install
```

### Build

Build all packages in the correct order:

```bash
bun run build
```

### Running Example

You can run the example script in the root to test the library in real-time:

```bash
bun run example.ts
```

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](./CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE) file for details.
