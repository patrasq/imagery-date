/** Text the Codex hooks give the model, or show the user. */
export const CODEX_HOOKS_COPY = Object.freeze({
  verifyFirst: [
    'The files changed in this session have not passed `pnpm verify` yet, so the task is not finished (AGENTS.md).',
    'Run `pnpm verify`. If a gate fails, fix the cause without weakening any rule (the fix-verify-failure skill gives',
    'the fix for each rule) and run it again. If the failure is outside this task, stop and say which gate fails.',
  ].join('\n'),
  notVerified: 'The changes in this session have not passed `pnpm verify`.',
  nodeMismatch: (expected: string, running: string): string =>
    `Node ${running} is running; this repository uses Node ${expected} (.nvmrc). The gates may fail for that reason.`,
  notInstalled:
    'Dependencies are not installed. Run `pnpm install --frozen-lockfile` first (it needs the npm registry).',
});
