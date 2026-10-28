import { defineConfig } from 'vitest/config';

const LIB = 'packages/imagery-date';

// Specs that start a local HTTP server reach it directly, never through an HTTP proxy from the environment (a
// corporate proxy, or the Codex sandbox, which sets NODE_USE_ENV_PROXY). Node reads these when a worker starts.
const LOOPBACK = ['127.0.0.1', 'localhost'];
for (const name of ['NO_PROXY', 'no_proxy']) {
  process.env[name] = [process.env[name], ...LOOPBACK].filter(Boolean).join(',');
}

export default defineConfig({
  resolve: { conditions: ['source'] },
  ssr: { resolve: { conditions: ['source'], externalConditions: ['source'] } },
  test: {
    environment: 'node',
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [
            `${LIB}/src/**/*.spec.ts`,
            'scripts/**/*.spec.ts',
            '.codex/hooks/**/*.spec.ts',
            'apps/demo/src/**/*.spec.ts',
          ],
        },
      },
      {
        // Provider adapters against responses recorded from the real services (CONTRIBUTING.md, Tests).
        extends: true,
        test: { name: 'recorded', include: [`${LIB}/test/**/*.spec.ts`], exclude: [`${LIB}/test/live/**`] },
      },
      {
        // Hits the real services; run by hand with `pnpm test:live`, never in `pnpm verify`.
        extends: true,
        test: { name: 'live', include: [`${LIB}/test/live/**/*.spec.ts`], testTimeout: 180_000 },
      },
    ],
    coverage: {
      provider: 'v8',
      include: [`${LIB}/src/**/*.ts`],
      exclude: [
        '**/*.spec.ts',
        '**/*.interface.ts',
        '**/*.type.ts',
        `${LIB}/src/index.ts`,
        `${LIB}/src/testing/index.ts`,
        `${LIB}/src/interface/cli/cli.ts`,
      ],
      reporter: ['text-summary', 'html'],
      thresholds: {
        lines: 85,
        [`${LIB}/src/domain/**`]: { lines: 95 },
        [`${LIB}/src/application/**`]: { lines: 95 },
      },
    },
  },
});
