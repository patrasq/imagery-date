import type { CODEX_HOOKS } from './codex-hooks.constants.ts';

/** The Stop hook's answer to Codex: empty to let the turn end, `block` with a reason to continue it. */
export interface StopHookOutput {
  readonly decision?: typeof CODEX_HOOKS.block;
  readonly reason?: string;
  readonly systemMessage?: string;
}
