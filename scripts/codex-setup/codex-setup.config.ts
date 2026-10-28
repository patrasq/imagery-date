import { CODEX_SETUP as S } from './codex-setup.constants.ts';

/** The environment the checks run Codex in: the caller's, with CODEX_HOME pointing at a throwaway home. */
export const CODEX_SETUP_CONFIG = Object.freeze({
  environment: (codexHome: string): NodeJS.ProcessEnv => ({ ...process.env, [S.homeVariable]: codexHome }),
});
