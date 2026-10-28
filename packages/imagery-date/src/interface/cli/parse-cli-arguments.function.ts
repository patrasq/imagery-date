import { parseArgs } from 'node:util';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';
import type { CliArguments } from './cli-arguments.interface.ts';
import { CliCommand } from './cli-command.enum.ts';
import type { CliCommandValue } from './cli-command.type.ts';
import { CliUsageError } from './cli-usage.error.ts';
import { parseNumber } from './parse-number.function.ts';

const NAMED: ReadonlyMap<string, CliCommandValue> = new Map([
  [CLI.commands.history, CliCommand.History],
  [CLI.commands.batch, CliCommand.Batch],
  [CLI.commands.providers, CliCommand.Providers],
]);

const parse = (
  argv: readonly string[],
): ReturnType<typeof parseArgs<{ options: typeof CLI.parseOptions; allowPositionals: true }>> => {
  try {
    return parseArgs({ args: [...argv], options: CLI.parseOptions, allowPositionals: true, strict: true });
  } catch (error: unknown) {
    throw new CliUsageError(error instanceof Error ? error.message : String(error));
  }
};

const concurrency = (text: string | undefined): number | null => {
  if (text === undefined) return null;
  const value = parseNumber(text, CLI.parseOptions.concurrency.type);
  if (!Number.isInteger(value) || value < 1) throw new CliUsageError(CLI_COPY.concurrencyRange);
  return value;
};

/** argv (without `node` and the script) as a command and its options. @throws CliUsageError */
export function parseCliArguments(argv: readonly string[]): CliArguments {
  const { values, positionals } = parse(argv);
  const [first = '', ...rest] = positionals;
  const named = NAMED.get(first);
  const flagged = values.help === true ? CliCommand.Help : values.version === true ? CliCommand.Version : null;
  return {
    command: flagged ?? named ?? CliCommand.Lookup,
    positionals: named === undefined ? positionals : rest,
    zoom: values.zoom === undefined ? null : parseNumber(values.zoom, CLI_COPY.zoom),
    providers: values.providers === undefined ? null : values.providers.split(CLI.listSeparator),
    concurrency: concurrency(values.concurrency),
    json: values.json === true,
  };
}
