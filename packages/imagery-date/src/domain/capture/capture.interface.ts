import type { CalendarDay } from '../calendar/calendar-day.value-object.ts';
import type { ZoomRange } from '../geo/zoom-range.value-object.ts';
import type { ProviderIdValue } from '../provider/provider-id.type.ts';
import type { CaptureDate } from './capture-date.value-object.ts';

/**
 * One photo a provider shows at the point, with what the provider states about it. Every field is either what the
 * provider published or null: nothing here is estimated. A capture date says when the photo was taken, not that the
 * place still looks like that.
 */
export interface Capture {
  readonly provider: ProviderIdValue;
  readonly date: CaptureDate;
  /** The provider's name for the imagery product or source (`Vivid Advanced`, `BD ORTHO 2024`). */
  readonly product: string | null;
  /** Ground size of one pixel, in metres. */
  readonly resolutionMetres: number | null;
  /** The zoom levels at which the provider shows this photo. */
  readonly zoomRange: ZoomRange | null;
  /** How far the photo's position (a street panorama, a building) is from the point asked about. */
  readonly distanceMetres: number | null;
  /** The day the provider first published this photo (Esri Wayback releases). */
  readonly publishedOn: CalendarDay | null;
  /** The credit line the provider gives for this photo. */
  readonly attribution: string | null;
}
