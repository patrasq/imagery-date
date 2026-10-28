import type { Capture } from '../../domain/capture/capture.interface.ts';
import { CLI } from './cli.constants.ts';
import { CLI_COPY } from './cli.copy.ts';

const or = <T>(value: T | null, show: (present: T) => string): string => (value === null ? CLI.empty : show(value));

/** A capture's table cells after provider and status: taken, product, pixel, zoom, distance, published. */
export function captureCells(capture: Capture): string[] {
  return [
    capture.date.value,
    capture.product ?? CLI.empty,
    or(capture.resolutionMetres, CLI_COPY.metres),
    or(capture.zoomRange, (range) => CLI_COPY.zoomRange(range.minimum, range.maximum)),
    or(capture.distanceMetres, CLI_COPY.metres),
    or(capture.publishedOn, (day) => day.toIsoString()),
  ];
}
