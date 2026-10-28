import type { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import type { ZoomRange } from '../../../domain/geo/zoom-range.value-object.ts';
import type { ProviderIdValue } from '../../../domain/provider/provider-id.type.ts';

export interface EsriCaptureContext {
  readonly provider: ProviderIdValue;
  readonly host: string;
  readonly attribution: string;
  readonly publishedOn: CalendarDay | null;
  /** The zoom range to state when the footprint has none (Wayback layers are per zoom). */
  readonly zoomRange: ZoomRange | null;
}
