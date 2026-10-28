import { CLI } from './cli.constants.ts';

/** The command line's environment. The key is sent only to Google, never written anywhere. */
export const CLI_CONFIG = Object.freeze({
  googleKey: process.env[CLI.environment.googleKey] ?? null,
});
