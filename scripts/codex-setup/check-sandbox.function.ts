import type { CommandRunner } from '../../.codex/hooks/lib/command-runner.type.ts';
import { tailText } from '../../.codex/hooks/lib/tail-text.function.ts';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup.copy.ts';

/**
 * Problems with the permission profiles: the tests must pass in the default one, and no profile may reach a host it
 * does not list.
 */
export function checkSandbox(run: CommandRunner): string[] {
  const tests = run(S.sandboxTests);
  return [
    ...(tests.status === 0 ? [] : [COPY.sandboxTestsFailed(tailText(tests.stdout + tests.stderr))]),
    ...S.profiles
      .filter((profile) => run([...S.sandbox(profile), ...S.blockedHostProbe]).status !== 0)
      .map((profile) => COPY.hostNotBlocked(profile)),
  ];
}
