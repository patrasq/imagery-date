import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';
import { CODEX_HOOKS_COPY } from './codex-hooks.copy.ts';

const major = (version: string): string | null => H.nodeMajor.exec(version.trim())?.[1] ?? null;

/** What would make every gate fail before any code is read: another Node major than .nvmrc, or no install. */
export function sessionProblems(nvmrc: string, runningNode: string, installed: boolean): string[] {
  const expected = nvmrc.trim();
  return [
    ...(major(expected) === major(runningNode) ? [] : [CODEX_HOOKS_COPY.nodeMismatch(expected, runningNode)]),
    ...(installed ? [] : [CODEX_HOOKS_COPY.notInstalled]),
  ];
}
