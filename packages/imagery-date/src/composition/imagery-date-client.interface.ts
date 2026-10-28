import type { BatchResult } from '../application/batch/batch-result.interface.ts';
import type { ImageryDateReport } from '../domain/outcome/imagery-date-report.interface.ts';
import type { ProviderDescriptor } from '../domain/provider/provider-descriptor.interface.ts';
import type { BatchOptions } from './batch-options.interface.ts';
import type { HistoryOptions } from './history-options.interface.ts';
import type { LookupOptions } from './lookup-options.interface.ts';
import type { PointInput } from './point-input.interface.ts';

/**
 * Dates the imagery at points. Methods reject only for refused input (`ImageryDateError`: coordinates, zoom, an
 * unknown provider); a provider that fails is reported in its outcome and never fails the lookup.
 */
export interface ImageryDateClient {
  /** Every provider this client can ask, in report order. */
  readonly providers: readonly ProviderDescriptor[];

  lookup(latitude: number, longitude: number, options?: LookupOptions): Promise<ImageryDateReport>;

  /** Every photo Esri World Imagery has shown at the point since 2014 (Wayback), newest first. */
  history(latitude: number, longitude: number, options?: HistoryOptions): Promise<ImageryDateReport>;

  /**
   * Reports in input order, at most `concurrency` points at once, with memory bounded by `concurrency` however many
   * points come in. A refused point yields a result carrying its `error`; the batch goes on.
   */
  lookupMany(
    points: AsyncIterable<PointInput> | Iterable<PointInput>,
    options?: BatchOptions,
  ): AsyncGenerator<BatchResult>;
}
