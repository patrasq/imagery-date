// Loads this repository's Codex setup in the installed Codex and fails on any part Codex would not use as intended:
// strict config, rule decisions, instructions, skills, custom agents and hooks. Run with `pnpm check:codex`
// (CI: .github/workflows/codex.yml). Needs `codex` on PATH; no login and no network.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CommandResult } from '../.codex/hooks/lib/command-result.interface.ts';
import { runCommand } from '../.codex/hooks/lib/run-command.function.ts';
import { checkHooks } from './codex-setup/check-hooks.function.ts';
import { checkPromptInput } from './codex-setup/check-prompt-input.function.ts';
import { checkRuleCases } from './codex-setup/check-rule-cases.function.ts';
import { checkStrictConfig } from './codex-setup/check-strict-config.function.ts';
import { CODEX_SETUP_CONFIG } from './codex-setup/codex-setup.config.ts';
import { CODEX_SETUP as S } from './codex-setup/codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup/codex-setup.copy.ts';
import { RULE_CASES } from './codex-setup/rule-cases.constants.ts';

const root = process.cwd();
const home = mkdtempSync(join(tmpdir(), S.temporaryPrefix));
writeFileSync(join(home, S.configFile), S.trustedProject(root));
const environment = CODEX_SETUP_CONFIG.environment(home);
const run = (command: readonly string[]): CommandResult => runCommand(root, command, { environment });
const shell = (command: string, input: string): CommandResult => runCommand(root, [...S.shell, command], { input });

const problems = [
  ...checkStrictConfig(run),
  ...checkRuleCases(run),
  ...checkPromptInput(root, run),
  ...checkHooks(root, shell),
];
const version = run(S.version).stdout;
rmSync(home, { recursive: true, force: true });

for (const problem of problems) process.stderr.write(COPY.line(problem));
if (problems.length > 0) {
  process.stderr.write(COPY.summary(problems.length));
  process.exitCode = 1;
} else {
  process.stdout.write(COPY.ok(version, RULE_CASES.length + S.instructionFiles.length));
}
