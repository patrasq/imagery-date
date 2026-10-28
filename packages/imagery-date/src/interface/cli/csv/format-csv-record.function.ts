import { CSV } from './csv.constants.ts';

const field = (value: string): string =>
  CSV.needsQuoting.test(value) ? CSV.quote + value.replace(CSV.quoteEverywhere, CSV.escapedQuote) + CSV.quote : value;

/** One CSV line (RFC 4180), quoting only the fields that need it. */
export function formatCsvRecord(values: readonly string[]): string {
  return values.map(field).join(CSV.delimiter) + CSV.newline;
}
