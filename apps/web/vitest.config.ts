import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

const configDirectory = fileURLToPath(new URL('.', import.meta.url));

// Mirrors the tsconfig path aliases so tests can import components that use
// the `@/` alias. Environments stay per-file via @vitest-environment
// docblocks.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    exclude: [
      ...configDefaults.exclude,
      '**/.next/**',
      '**/.open-next/**',
      '**/coverage/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(configDirectory),
      '@mindpulse/shared': path.resolve(
        configDirectory,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
});
