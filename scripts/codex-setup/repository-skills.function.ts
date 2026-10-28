import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';
import type { RepositorySkill } from './repository-skill.interface.ts';

/** The skills under .agents/skills, with their names and whether Codex may pick them without `$name`. */
export function repositorySkills(root: string): RepositorySkill[] {
  const directory = join(root, S.skillsDirectory);
  return readdirSync(directory).flatMap((folder) => {
    const name = S.skillName.exec(readFileSync(join(directory, folder, S.skillFile), S.encoding))?.[1];
    const policy = join(directory, folder, S.skillPolicyFile);
    const explicitOnly = existsSync(policy) && S.explicitOnly.test(readFileSync(policy, S.encoding));
    return name === undefined ? [] : [{ name, explicitOnly }];
  });
}
