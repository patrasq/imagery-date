import { CLI } from './cli.constants.ts';

/** Rows as aligned text columns, the header first; trailing spaces trimmed. */
export function formatTable(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const all = [header, ...rows];
  const widths = header.map((_, column) => Math.max(...all.map((row) => (row[column] ?? CLI.empty).length)));
  const line = (row: readonly string[]): string =>
    widths
      .map((width, column) => (row[column] ?? CLI.empty).padEnd(width))
      .join(CLI.columnGap)
      .trimEnd();
  return all.map(line).join(CLI.newline) + CLI.newline;
}
