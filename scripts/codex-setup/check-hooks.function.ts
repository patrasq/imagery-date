import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CommandResult } from '../../.codex/hooks/lib/command-result.interface.ts';
import { tailText } from '../../.codex/hooks/lib/tail-text.function.ts';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup.copy.ts';
import { hooksFileSchema } from './hooks-file.schema.ts';

/** Runs one hook command line the way Codex does (a shell in the repository root) with `input` on stdin. */
type HookShell = (command: string, input: string) => CommandResult;

const isJson = (text: string): boolean => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const smoke = (event: string, command: string, input: object, shell: HookShell): string[] => {
  const result = shell(command, JSON.stringify(input));
  if (result.status !== 0) return [COPY.hookFailed(event, tailText(result.stdout + result.stderr))];
  const printed = result.stdout.trim();
  return printed === '' || isJson(printed) ? [] : [COPY.hookOutputNotJson(event, tailText(printed))];
};

/** Problems with .codex/hooks.json: its shape, and each hook's exact command run on a harmless sample input. */
export function checkHooks(root: string, shell: HookShell): string[] {
  const file = hooksFileSchema.parse(JSON.parse(readFileSync(join(root, S.hooksFile), S.encoding)));
  return Object.entries(file.hooks).flatMap(([event, groups]) => {
    const input = S.hookInputs[event];
    if (input === undefined) return [COPY.unknownHookEvent(event)];
    return groups.flatMap((group) => group.hooks).flatMap((handler) => smoke(event, handler.command, input, shell));
  });
}
