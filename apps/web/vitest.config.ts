import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Mirrors the tsconfig path aliases so tests can import components that use
// the `@/` alias. Environments stay per-file via @vitest-environment
// docblocks.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@mindpulse/shared': path.resolve(
        __dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
});
