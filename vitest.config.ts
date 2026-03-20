import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    alias: {
      '@dispipe/protocol': resolve(__dirname, 'packages/protocol/src/index.ts'),
    },
  },
});
