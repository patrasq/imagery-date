import { CLI } from '../cli.constants.ts';
import { CLI_COPY } from '../cli.copy.ts';
import { CliCommand } from '../cli-command.enum.ts';
import type { CliCommandValue } from '../cli-command.type.ts';
import { renderProviders } from '../render-providers.function.ts';
import type { CliHandler } from './cli-handler.type.ts';
import { runBatch } from './run-batch.function.ts';
import { runHistory } from './run-history.function.ts';
import { runLookup } from './run-lookup.function.ts';

/** Every command and what runs it. */
export const CLI_HANDLERS: Readonly<Record<CliCommandValue, CliHandler>> = Object.freeze({
  [CliCommand.Lookup]: runLookup,
  [CliCommand.History]: runHistory,
  [CliCommand.Batch]: runBatch,
  [CliCommand.Providers]: async (parsed, context) => {
    const providers = context.client.providers;
    await context.io.write(
      parsed.json ? JSON.stringify(providers, null, CLI.jsonIndentation) + CLI.newline : renderProviders(providers),
    );
    return CLI.exit.ok;
  },
  [CliCommand.Help]: async (_, context) => {
    await context.io.write(CLI_COPY.help);
    return CLI.exit.ok;
  },
  [CliCommand.Version]: async (_, context) => {
    await context.io.write(context.version + CLI.newline);
    return CLI.exit.ok;
  },
});
