import type { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';

/** One archived version of Esri World Imagery. */
export interface WaybackRelease {
  readonly number: number;
  readonly publishedOn: CalendarDay;
  readonly metadataLayerUrl: string;
}
