import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CommandRunner } from '../../.codex/hooks/lib/command-runner.type.ts';
import { tailText } from '../../.codex/hooks/lib/tail-text.function.ts';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import { CODEX_SETUP_COPY as COPY } from './codex-setup.copy.ts';
import { repositorySkills } from './repository-skills.function.ts';

/** Text as it appears inside the JSON that `codex debug prompt-input` prints. */
const inJson = (text: string): string => JSON.stringify(text).slice(1, -1);

const agentNames = (root: string): string[] =>
  readdirSync(join(root, S.agentsDirectory))
    .filter((file) => S.agentFile.test(file))
    .flatMap((file) => S.agentName.exec(readFileSync(join(root, S.agentsDirectory, file), S.encoding))?.[1] ?? []);

/**
 * Parts of the setup missing from the model's input: the full root instructions (not cut by the size limit), every
 * implicit skill, every custom agent; and explicit-only skills that are listed anyway.
 */
export function checkPromptInput(root: string, run: CommandRunner): string[] {
  const result = run(S.promptInput);
  if (result.status !== 0) return [COPY.promptInputFailed(tailText(result.stdout + result.stderr))];
  const prompt = result.stdout;
  const has = (text: string): boolean => prompt.includes(inJson(text));
  const skills = repositorySkills(root);
  return [
    ...S.instructionFiles
      .filter((file) => !has(readFileSync(join(root, file), S.encoding).trim()))
      .map((file) => COPY.missingFromPrompt(COPY.instructions(file))),
    ...skills
      .filter((skill) => has(S.listedSkill(skill.name)) === skill.explicitOnly)
      .map((skill) => (skill.explicitOnly ? COPY.unexpectedInPrompt : COPY.missingFromPrompt)(COPY.skill(skill.name))),
    ...agentNames(root)
      .filter((name) => !has(S.listedRole(name)))
      .map((name) => COPY.missingFromPrompt(COPY.agent(name))),
  ];
}
