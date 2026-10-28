import type { CommandRunner } from '../../.codex/hooks/lib/command-runner.type.ts';
import { tailText } from '../../.codex/hooks/lib/tail-text.function.ts';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup.copy.ts';

/** Problems loading every config layer with `--strict-config`, which rejects keys this Codex version does not know. */
export function checkStrictConfig(run: CommandRunner): string[] {
  const result = run(S.strictConfig);
  const output = result.stdout + result.stderr;
  return output.includes(S.configLoaded) ? [] : [COPY.configNotLoaded(tailText(output))];
}
