import { BATCH } from '../batch/batch.constants.ts';
import { batchPoints } from '../batch/batch-points.function.ts';
import { batchRows } from '../batch/batch-rows.function.ts';
import { CLI } from '../cli.constants.ts';
import type { CliArguments } from '../cli-arguments.interface.ts';
import type { CliContext } from '../cli-context.interface.ts';
import { csvRecords } from '../csv/csv-records.function.ts';
import { formatCsvRecord } from '../csv/format-csv-record.function.ts';

/**
 * `imagery-date batch <points.csv | ->`: streams the CSV through the client and writes one row per photo, in input
 * order. Memory is bounded by the concurrency, so a file of millions of points runs in constant memory.
 */
export async function runBatch(parsed: CliArguments, context: CliContext): Promise<number> {
  const path = parsed.positionals[0] ?? CLI.stdinPath;
  const points = batchPoints(csvRecords(context.io.read(path)));
  const options = {
    ...(parsed.zoom === null ? {} : { zoom: parsed.zoom }),
    ...(parsed.providers === null ? {} : { providers: parsed.providers }),
    ...(parsed.concurrency === null ? {} : { concurrency: parsed.concurrency }),
  };
  await context.io.write(formatCsvRecord(BATCH.outputColumns));
  for await (const result of context.client.lookupMany(points, options)) {
    for (const row of batchRows(result)) await context.io.write(formatCsvRecord(row));
  }
  return CLI.exit.ok;
}
