# Contributing to Dispipe

First, thank you for considering contributing to Dispipe!

## 🛠️ Development Environment

This project uses [Bun](https://bun.sh) for managing dependencies and workspaces.

### Prerequisites

- [Bun](https://bun.sh/docs/installation) (v1.0.0 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/HarukaYamamoto0/dispipe.git
   cd dispipe
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Build all packages:
   ```bash
   bun run build
   ```

## 🏗️ Monorepo Structure

The project is split into two main packages:

- **`packages/protocol`**: Contains Zod schemas, constants, and shared types. Most of these are inspired by the official `embedded-app-sdk`.
- **`packages/core`**: The main library logic, including IPC/WebSocket transport and the client implementation.

## 🧪 Testing

To test your changes, you can use the provided example script:

```bash
bun run example.ts
```

*Note: Make sure you have a Discord client running to test Rich Presence updates.*

## 📜 Coding Guidelines

- **TypeScript**: Use strict TypeScript. All new features must be typed.
- **Validation**: All data sent to or received from Discord must be validated using Zod schemas in `@dispipe/protocol`.
- **Documentation**: If you add new public methods or classes, please include JSDoc comments with examples.
- **English**: All comments and documentation must be in English.

## 🚀 Pull Request Process

1. Create a new branch for your feature or bugfix.
2. Ensure the project builds successfully (`bun run build`).
3. Submit a Pull Request with a clear description of your changes.

## 📄 License

By contributing to Dispipe, you agree that your contributions will be licensed under its MIT License.
