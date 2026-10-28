import type { Capture } from '../capture/capture.interface.ts';
import type { GeoPoint } from '../geo/geo-point.value-object.ts';
import type { ZoomLevel } from '../geo/zoom-level.value-object.ts';
import type { ProviderOutcome } from './provider-outcome.interface.ts';

/** Every asked provider's answer for one point, and the most recent photo shown at the zoom asked about. */
export interface ImageryDateReport {
  readonly point: GeoPoint;
  readonly zoom: ZoomLevel;
  /** When the providers were asked: their imagery changes, so an answer is true as of this moment. */
  readonly observedAt: string;
  /** One per provider asked, in the order of `ProviderId`. */
  readonly outcomes: readonly ProviderOutcome[];
  /** The most recently taken photo any provider shows at `zoom`; null when none is dated. */
  readonly newest: Capture | null;
}
