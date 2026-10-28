import { CLI } from '../cli.constants.ts';
import type { CliArguments } from '../cli-arguments.interface.ts';
import type { CliContext } from '../cli-context.interface.ts';
import { renderHistory } from '../render-history.function.ts';
import { pointArguments } from './point-arguments.function.ts';

/** `imagery-date history <latitude> <longitude>`: every photo Esri has shown at the point since 2014. */
export async function runHistory(parsed: CliArguments, context: CliContext): Promise<number> {
  const { latitude, longitude, options } = pointArguments(parsed);
  const report = await context.client.history(latitude, longitude, options);
  await context.io.write(
    parsed.json ? JSON.stringify(report, null, CLI.jsonIndentation) + CLI.newline : renderHistory(report),
  );
  return CLI.exit.ok;
}
