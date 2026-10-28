import type { PointInput } from '../../../composition/point-input.interface.ts';
import { CLI_COPY } from '../cli.copy.ts';
import { CliUsageError } from '../cli-usage.error.ts';
import { BATCH } from './batch.constants.ts';

interface Columns {
  readonly latitude: number;
  readonly longitude: number;
  readonly key: number;
  readonly zoom: number;
}

const columnOf = (header: readonly string[], names: readonly string[]): number =>
  header.findIndex((name) => names.includes(name.trim().toLowerCase()));

const columns = (header: readonly string[]): Columns => {
  const found = {
    latitude: columnOf(header, BATCH.inputColumns.latitude),
    longitude: columnOf(header, BATCH.inputColumns.longitude),
    key: columnOf(header, BATCH.inputColumns.key),
    zoom: columnOf(header, BATCH.inputColumns.zoom),
  };
  if (found.latitude < 0 || found.longitude < 0) throw new CliUsageError(CLI_COPY.missingColumns(header));
  return found;
};

/** Blank is not 0: a blank coordinate is refused by the library instead of becoming the equator. */
const coordinate = (text: string | undefined): number =>
  text === undefined || text.trim() === '' ? Number.NaN : Number(text);

/**
 * The points of a CSV whose first record is its header. A row's key is its id column, or its row number. A row with
 * unreadable coordinates still becomes a point, so the library reports it as refused in its place.
 * @throws CliUsageError when the header has no latitude or longitude column.
 */
export async function* batchPoints(records: AsyncIterable<string[]>): AsyncGenerator<PointInput> {
  let found: Columns | null = null;
  let row = BATCH.firstRow;
  for await (const record of records) {
    if (found === null) {
      found = columns(record);
      continue;
    }
    const zoom = record[found.zoom]?.trim() ?? '';
    const base = {
      key: record[found.key] ?? String(row),
      latitude: coordinate(record[found.latitude]),
      longitude: coordinate(record[found.longitude]),
    };
    yield zoom === '' ? base : { ...base, zoom: Number(zoom) };
    row += 1;
  }
}
