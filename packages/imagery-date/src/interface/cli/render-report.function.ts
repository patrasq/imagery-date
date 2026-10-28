import type { ImageryDateReport } from '../../domain/outcome/imagery-date-report.interface.ts';
import { OutcomeStatus } from '../../domain/outcome/outcome-status.enum.ts';
import type { OutcomeStatusValue } from '../../domain/outcome/outcome-status.type.ts';
import type { ProviderOutcome } from '../../domain/outcome/provider-outcome.interface.ts';
import type { ProviderDescriptor } from '../../domain/provider/provider-descriptor.interface.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import { captureCells } from './capture-cells.function.ts';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';
import { formatTable } from './format-table.function.ts';

/** What the table says for an outcome without photos, when the outcome carries no failure detail. */
const QUIET_DETAIL: Readonly<Partial<Record<OutcomeStatusValue, string>>> = Object.freeze({
  [OutcomeStatus.OutsideCoverage]: CLI_COPY.outsideCoverage,
  [OutcomeStatus.NoDate]: CLI_COPY.noDate,
});

/** The six capture cells, blank, so a note lands in the last column. */
const NO_CAPTURE: readonly string[] = Object.freeze(Array.from({ length: CLI.captureCellCount }, () => CLI.empty));

const rows = (outcome: ProviderOutcome, name: string): string[][] => {
  if (outcome.captures.length === 0) {
    const detail = outcome.failure?.detail ?? QUIET_DETAIL[outcome.status] ?? CLI.empty;
    return [[name, outcome.status, ...NO_CAPTURE, detail]];
  }
  const rows = outcome.captures.map((capture) => [name, outcome.status, ...captureCells(capture)]);
  return outcome.failure === null ? rows : [...rows, [name, outcome.status, ...NO_CAPTURE, outcome.failure.detail]];
};

/** A report as text: where and when, the newest photo, one table row per photo, and the caveat. */
export function renderReport(report: ImageryDateReport, providers: readonly ProviderDescriptor[]): string {
  const names = new Map(providers.map((provider) => [provider.id, provider.name]));
  const name = (id: ProviderIdValue): string => names.get(id) ?? id;
  const { point, zoom, newest } = report;
  const heading = CLI_COPY.reportHeading(point.latitude, point.longitude, zoom.value, report.observedAt);
  const summary = newest === null ? CLI_COPY.noNewest : CLI_COPY.newest(newest.date.value, name(newest.provider));
  const table = formatTable(
    CLI_COPY.columns,
    report.outcomes.flatMap((outcome) => rows(outcome, name(outcome.provider))),
  );
  return [heading, summary, CLI.empty, table, CLI_COPY.caveat, CLI.empty].join(CLI.newline);
}
