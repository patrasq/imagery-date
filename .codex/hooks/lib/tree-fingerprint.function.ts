import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';
import type { CommandRunner } from './command-runner.type.ts';

/** A hash of HEAD, the uncommitted diff and the untracked files' contents; null when nothing is uncommitted. */
export function treeFingerprint(root: string, run: CommandRunner): string | null {
  if (run(H.git.status).stdout.trim() === '') return null;
  const hash = createHash(H.hash).update(run(H.git.head).stdout).update(run(H.git.diff).stdout);
  const untracked = run(H.git.untracked)
    .stdout.split(H.untrackedSeparator)
    .filter((path) => path !== '');
  for (const path of untracked) hash.update(path).update(readFileSync(join(root, path)));
  return hash.digest(H.hashEncoding);
}
