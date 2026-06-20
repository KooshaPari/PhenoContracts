import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['ports/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json-summary', 'html'],
      include: ['ports/**/*.ts'],
      exclude: ['ports/**/*.test.ts', 'ports/tests/**', 'ports/**/index.ts', 'ports/**/*registry.ts', '**/*.d.ts'],
      thresholds: {
        // Per ADR-040 (test coverage gates per tier) — lib tier = 80%
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
