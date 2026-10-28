import type { CommandRunner } from '../../.codex/hooks/lib/command-runner.type.ts';
import { tailText } from '../../.codex/hooks/lib/tail-text.function.ts';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup.copy.ts';
import { execpolicyResultSchema } from './execpolicy-result.schema.ts';
import { RULE_CASES } from './rule-cases.constants.ts';

/** Commands whose decision under .codex/rules differs from RULE_CASES. Loading the rules also checks their examples. */
export function checkRuleCases(run: CommandRunner): string[] {
  return RULE_CASES.flatMap(({ command, decision }) => {
    const result = run([...S.execpolicy, S.rulesFile, S.commandSeparator, ...command.split(S.argumentSeparator)]);
    if (result.status !== 0) return [COPY.rulesUnreadable(tailText(result.stdout + result.stderr))];
    const actual = execpolicyResultSchema.parse(JSON.parse(result.stdout)).decision ?? S.noDecision;
    return actual === decision ? [] : [COPY.wrongDecision(command, decision, actual)];
  });
}
