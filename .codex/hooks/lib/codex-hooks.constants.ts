// Values the Codex hooks (.codex/hooks/*.ts, run by .codex/hooks.json) use. Hooks run outside the sandbox, so they
// live in .codex/ (read-only to sandboxed commands) and import Node built-ins only: no package, no repository code.
export const CODEX_HOOKS = Object.freeze({
  encoding: 'utf8',
  /** git diff --binary of a large change can exceed spawnSync's 1 MiB default. */
  maxOutputBytes: 64 * 1024 * 1024,
  newline: '\n',
  git: Object.freeze({
    root: ['git', 'rev-parse', '--show-toplevel'],
    head: ['git', 'rev-parse', 'HEAD'],
    status: ['git', 'status', '--porcelain'],
    diff: ['git', 'diff', 'HEAD', '--binary'],
    untracked: ['git', 'ls-files', '--others', '--exclude-standard', '-z'],
  }),
  untrackedSeparator: '\0',
  hash: 'sha256',
  hashEncoding: 'hex',
  /** Ignored by git, inside the checkout. */
  fingerprintDirectory: 'node_modules/.cache/imagery-date-codex',
  /** Written by `pnpm verify` when every gate passed (scripts/record-verified-tree.ts). */
  verifiedFile: 'verified-tree',
  /** Written by the SessionStart hook: the tree as the session found it. */
  sessionFile: (sessionId: string): string => `session-${sessionId.replace(/[^\w-]/g, '')}`,
  fields: Object.freeze({ sessionId: 'session_id', stopHookActive: 'stop_hook_active' }),
  block: 'block',
  /** How much of a command's output a message keeps. */
  output: Object.freeze({ maxLines: 60, maxCharacters: 6000 }),
  nvmrc: '.nvmrc',
  installedMarker: 'node_modules/.modules.yaml',
  nodeMajor: /^v?(\d+)/,
  sessionStartEvent: 'SessionStart',
} as const);
