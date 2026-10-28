import type { BatchResult } from '../../../application/batch/batch-result.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import type { ImageryDateReport } from '../../../domain/outcome/imagery-date-report.interface.ts';
import type { ProviderOutcome } from '../../../domain/outcome/provider-outcome.interface.ts';
import { CLI } from '../cli.constants.ts';
import { CLI_COPY } from '../cli.copy.ts';
import { BATCH } from './batch.constants.ts';

const text = (value: number | string | null | undefined): string =>
  value === null || value === undefined ? CLI.empty : String(value);

const captureCells = (capture: Capture, newest: Capture | null): string[] => [
  capture.date.value,
  capture.date.precision,
  capture.date.start.toIsoString(),
  capture.date.end.toIsoString(),
  text(capture.product),
  text(capture.resolutionMetres),
  text(capture.zoomRange?.minimum),
  text(capture.zoomRange?.maximum),
  text(capture.distanceMetres),
  text(capture.publishedOn?.toIsoString()),
  capture === newest ? CLI_COPY.yes : CLI.empty,
];

const NO_CAPTURE: readonly string[] = Object.freeze(Array.from({ length: BATCH.captureColumnCount }, () => CLI.empty));

const outcomeRows = (report: ImageryDateReport, outcome: ProviderOutcome, lead: readonly string[]): string[][] => {
  const failure = [text(outcome.failure?.code), text(outcome.failure?.detail)];
  const start = [...lead, outcome.provider, outcome.status];
  if (outcome.captures.length === 0) return [[...start, ...NO_CAPTURE, ...failure]];
  return outcome.captures.map((capture) => [...start, ...captureCells(capture, report.newest), ...failure]);
};

/** A batch result as CSV rows (columns of `BATCH.outputColumns`): one per photo, one per provider without photos. */
export function batchRows(result: BatchResult): string[][] {
  const report = result.report;
  if (report === null) {
    const refused = [result.key, CLI.empty, CLI.empty, CLI.empty, CLI.empty, CLI_COPY.refused, ...NO_CAPTURE];
    return [[...refused, text(result.error?.code), text(result.error?.message)]];
  }
  const lead = [result.key, String(report.point.latitude), String(report.point.longitude), String(report.zoom.value)];
  return report.outcomes.flatMap((outcome) => outcomeRows(report, outcome, lead));
}
