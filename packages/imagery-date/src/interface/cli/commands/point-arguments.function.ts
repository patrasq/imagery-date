import type { HistoryOptions } from '../../../composition/history-options.interface.ts';
import { CLI_COPY } from '../cli.copy.ts';
import type { CliArguments } from '../cli-arguments.interface.ts';
import { CliUsageError } from '../cli-usage.error.ts';
import { parseNumber } from '../parse-number.function.ts';

interface PointArguments {
  readonly latitude: number;
  readonly longitude: number;
  readonly options: HistoryOptions;
}

/** The latitude, longitude and zoom of a lookup. @throws CliUsageError when the point is missing or not numbers. */
export function pointArguments(parsed: CliArguments): PointArguments {
  const [latitude, longitude, ...extra] = parsed.positionals;
  if (latitude === undefined || longitude === undefined || extra.length > 0) {
    throw new CliUsageError(CLI_COPY.needsLatitudeLongitude);
  }
  return {
    latitude: parseNumber(latitude, CLI_COPY.latitude),
    longitude: parseNumber(longitude, CLI_COPY.longitude),
    options: parsed.zoom === null ? {} : { zoom: parsed.zoom },
  };
}
