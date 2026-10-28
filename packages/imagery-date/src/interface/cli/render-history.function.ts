import type { ImageryDateReport } from '../../domain/outcome/imagery-date-report.interface.ts';
import { captureCells } from './capture-cells.function.ts';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';
import { formatTable } from './format-table.function.ts';
import { HISTORY_COPY } from './history.copy.ts';

/** The Wayback history as text: one row per photo, newest first, with the day Esri first published it. */
export function renderHistory(report: ImageryDateReport): string {
  const { point, zoom } = report;
  const outcome = report.outcomes[0];
  const captures = outcome?.captures ?? [];
  const heading = CLI_COPY.reportHeading(point.latitude, point.longitude, zoom.value, report.observedAt);
  const summary = HISTORY_COPY.summary(captures.length);
  const rows = captures
    .map((capture) => captureCells(capture))
    .map(([taken = '', product = '', pixel = '', , , published = '']) => [taken, product, pixel, published]);
  const failure =
    outcome?.failure === null || outcome?.failure === undefined ? [] : [outcome.failure.detail, CLI.empty];
  const table = rows.length === 0 ? [] : [formatTable(HISTORY_COPY.columns, rows)];
  return [heading, summary, CLI.empty, ...table, ...failure].join(CLI.newline);
}
