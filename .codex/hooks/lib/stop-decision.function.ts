import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';
import { CODEX_HOOKS_COPY } from './codex-hooks.copy.ts';
import type { StopHookOutput } from './stop-hook-output.interface.ts';

/**
 * Lets the turn end when the tree is unchanged since the session started or has passed `pnpm verify`. Otherwise
 * continues it once, asking for `pnpm verify`; after that one retry the turn ends with a warning instead of looping.
 */
export function stopDecision(needsVerify: boolean, alreadyContinued: boolean): StopHookOutput {
  if (!needsVerify) return {};
  if (alreadyContinued) return { systemMessage: CODEX_HOOKS_COPY.notVerified };
  return { decision: H.block, reason: CODEX_HOOKS_COPY.verifyFirst };
}
