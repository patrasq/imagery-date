/** A skill under .agents/skills. */
export interface RepositorySkill {
  readonly name: string;
  /** Invoked only as `$name`, never picked by Codex on its own (agents/openai.yaml). */
  readonly explicitOnly: boolean;
}
