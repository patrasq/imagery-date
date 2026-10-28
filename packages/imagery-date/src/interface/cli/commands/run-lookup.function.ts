import { CLI } from '../cli.constants.ts';
import type { CliArguments } from '../cli-arguments.interface.ts';
import type { CliContext } from '../cli-context.interface.ts';
import { renderReport } from '../render-report.function.ts';
import { pointArguments } from './point-arguments.function.ts';

/** `imagery-date <latitude> <longitude>`: every provider's date for the point, as a table or JSON. */
export async function runLookup(parsed: CliArguments, context: CliContext): Promise<number> {
  const { latitude, longitude, options } = pointArguments(parsed);
  const providers = parsed.providers === null ? {} : { providers: parsed.providers };
  const report = await context.client.lookup(latitude, longitude, { ...options, ...providers });
  const text = parsed.json
    ? JSON.stringify(report, null, CLI.jsonIndentation) + CLI.newline
    : renderReport(report, context.client.providers);
  await context.io.write(text);
  return CLI.exit.ok;
}
