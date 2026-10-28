import type { ImageryDateError } from '../../domain/errors/imagery-date.error.ts';
import type { ImageryDateReport } from '../../domain/outcome/imagery-date-report.interface.ts';

/** One point of a batch: its report, or why the point was refused (coordinates, zoom). Exactly one is set. */
export interface BatchResult {
  readonly key: string;
  readonly report: ImageryDateReport | null;
  readonly error: ImageryDateError | null;
}
