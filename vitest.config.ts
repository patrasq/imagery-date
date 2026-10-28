import { defineConfig } from 'vitest/config';

const LIB = 'packages/imagery-date';

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
          include: [`${LIB}/src/**/*.spec.ts`, 'scripts/**/*.spec.ts', 'apps/demo/src/**/*.spec.ts'],
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
