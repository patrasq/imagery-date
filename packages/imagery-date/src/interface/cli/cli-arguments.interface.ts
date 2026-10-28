import type { CliCommandValue } from './cli-command.type.ts';

export interface CliArguments {
  readonly command: CliCommandValue;
  /** What follows the command: a latitude and a longitude, or a CSV path. */
  readonly positionals: readonly string[];
  readonly zoom: number | null;
  readonly providers: readonly string[] | null;
  readonly concurrency: number | null;
  readonly json: boolean;
}
