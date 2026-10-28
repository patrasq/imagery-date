/** What a command gets besides its arguments: an environment instead of the parent's, and text on stdin. */
export interface RunOptions {
  readonly environment?: NodeJS.ProcessEnv;
  readonly input?: string;
}
