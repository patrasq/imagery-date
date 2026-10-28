/** What one command-line run produced. */
export interface CliRun {
  readonly code: number;
  readonly output: string;
  readonly errors: string;
}
