/** How a finished command exited and what it printed. `status` is null when it could not start or was killed. */
export interface CommandResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
}
