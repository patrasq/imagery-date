import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { CommandResult } from '../../.codex/hooks/lib/command-result.interface.ts';
import { checkHooks } from './check-hooks.function.ts';
import { checkPromptInput } from './check-prompt-input.function.ts';
import { checkRuleCases } from './check-rule-cases.function.ts';
import { RULE_CASES } from './rule-cases.constants.ts';

const result = (stdout: string, status: number | null = 0): CommandResult => ({ status, stdout, stderr: '' });
const listed = [
  readFileSync('AGENTS.md', 'utf8').trim(),
  '- fix-verify-failure: ',
  '- add-provider: ',
  '- record-provider: ',
  'provider_auditor: {',
  'api_compat_checker: {',
];
const prompt = (entries: readonly string[]): string => JSON.stringify([{ text: entries.join('\n') }]);

describe(checkPromptInput.name, () => {
  it('accepts a model input with the root instructions, the implicit skills and the custom agents', () => {
    expect(checkPromptInput('.', () => result(prompt(listed)))).toEqual([]);
  });

  it('names what is missing, and an explicit-only skill that is listed', () => {
    const problems = checkPromptInput('.', () => result(prompt([...listed.slice(2), '- prepare-release: '])));
    expect(problems).toEqual([
      'prompt: the full text of AGENTS.md is not in the model input',
      'prompt: skill fix-verify-failure is not in the model input',
      'prompt: skill prepare-release is listed although it is explicit-only',
    ]);
  });
});

describe(checkRuleCases.name, () => {
  it('compares each decision with the expected one; no match counts as none', () => {
    const decisions = (command: readonly string[]): CommandResult =>
      result(command.includes('push') ? '{"matchedRules":[],"decision":"allow"}' : '{"matchedRules":[]}');
    const problems = checkRuleCases(decisions);
    expect(problems).toContain('rules: `git push origin main` gives allow, expected prompt');
    expect(problems).toContain('rules: `npm publish` gives none, expected forbidden');
    expect(problems).not.toContain(expect.stringContaining('`pnpm verify`'));
    expect(problems.length).toBeLessThan(RULE_CASES.length);
  });

  it('reports rules Codex cannot load', () => {
    expect(checkRuleCases(() => ({ status: 1, stdout: '', stderr: 'match example failed' }))[0]).toContain(
      'match example failed',
    );
  });
});

describe(checkHooks.name, () => {
  it('runs every hook command in .codex/hooks.json with a sample input and accepts JSON or nothing', () => {
    const commands: string[] = [];
    const problems = checkHooks('.', (command, input) => {
      commands.push(command);
      expect(JSON.parse(input)).toHaveProperty('hook_event_name');
      return result(command.includes('stop') ? '{}' : '');
    });
    expect(problems).toEqual([]);
    expect(commands).toHaveLength(2);
  });

  it('reports a hook that fails or prints something other than JSON', () => {
    const problems = checkHooks('.', (command) => (command.includes('stop') ? result('', 1) : result('hello')));
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain('printed non-JSON');
  });
});
