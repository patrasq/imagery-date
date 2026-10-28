import { CLI_COPY } from './cli.copy.ts';
import { CliUsageError } from './cli-usage.error.ts';

/** A number typed on the command line. Blank text is not 0. @throws CliUsageError when it is not a number. */
export function parseNumber(text: string, name: string): number {
  const value = text.trim() === '' ? Number.NaN : Number(text);
  if (!Number.isFinite(value)) throw new CliUsageError(CLI_COPY.notANumber(name, text));
  return value;
}
