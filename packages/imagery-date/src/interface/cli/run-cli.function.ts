import { ImageryDateError } from '../../domain/errors/imagery-date.error.ts';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';
import type { CliContext } from './cli-context.interface.ts';
import { CliUsageError } from './cli-usage.error.ts';
import { CLI_HANDLERS } from './commands/cli-handlers.map.ts';
import { parseCliArguments } from './parse-cli-arguments.function.ts';

/**
 * Runs the command line and resolves with the exit code: 0 done, 2 used wrongly (bad arguments, refused coordinates).
 * A provider that fails is part of the report, not an error: the other providers' answers are still printed.
 */
export async function runCli(argv: readonly string[], context: CliContext): Promise<number> {
  try {
    const parsed = parseCliArguments(argv);
    return await CLI_HANDLERS[parsed.command](parsed, context);
  } catch (error: unknown) {
    if (!(error instanceof CliUsageError || error instanceof ImageryDateError)) throw error;
    context.io.warn(CLI_COPY.error(error.message));
    return CLI.exit.usage;
  }
}
