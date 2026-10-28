import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { runCli } from '../../src/interface/cli/run-cli.function.ts';
import type { CliRun } from './cli-run.interface.ts';
import { memoryIo } from './memory-io.function.ts';
import { recordedClient } from './recorded-client.function.ts';
import { SUPPORT } from './support.constants.ts';

/** Runs the command line in memory against recorded exchanges, with the given files readable. */
export async function runRecordedCli(
  exchanges: readonly RecordedExchange[],
  argv: string[],
  files: Readonly<Record<string, string>> = {},
): Promise<CliRun> {
  const { io, output, errors } = memoryIo(files);
  const code = await runCli(argv, { client: recordedClient(exchanges).client, io, version: SUPPORT.version });
  return { code, output: output(), errors: errors() };
}
