/** Messages of `pnpm check:codex`. */
export const CODEX_SETUP_COPY = Object.freeze({
  configNotLoaded: (output: string): string => `.codex/config.toml did not load strictly:\n${output}`,
  wrongDecision: (command: string, expected: string, actual: string): string =>
    `rules: \`${command}\` gives ${actual}, expected ${expected}`,
  rulesUnreadable: (output: string): string => `rules: codex execpolicy check failed:\n${output}`,
  promptInputFailed: (output: string): string => `prompt: codex debug prompt-input failed:\n${output}`,
  missingFromPrompt: (what: string): string => `prompt: ${what} is not in the model input`,
  unexpectedInPrompt: (what: string): string => `prompt: ${what} is listed although it is explicit-only`,
  instructions: (file: string): string => `the full text of ${file}`,
  skill: (name: string): string => `skill ${name}`,
  agent: (name: string): string => `custom agent ${name}`,
  unknownHookEvent: (event: string): string => `hooks: no sample input for event ${event}; add one to the check`,
  hookFailed: (event: string, output: string): string => `hooks: the ${event} hook failed:\n${output}`,
  hookOutputNotJson: (event: string, output: string): string => `hooks: the ${event} hook printed non-JSON:\n${output}`,
  line: (problem: string): string => `${problem}\n`,
  summary: (count: number): string => `\n${String(count)} problem(s) in the Codex setup.\n`,
  ok: (version: string, checks: number): string =>
    `Codex setup loads as intended in ${version.trim()} (${String(checks)} checks).\n`,
});
