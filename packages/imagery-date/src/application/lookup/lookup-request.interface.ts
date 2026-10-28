import type { GeoPoint } from '../../domain/geo/geo-point.value-object.ts';
import type { ZoomLevel } from '../../domain/geo/zoom-level.value-object.ts';
import type { Credentials } from '../../domain/provider/credentials.type.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';

export interface LookupRequest {
  readonly point: GeoPoint;
  readonly zoom: ZoomLevel;
  /** The providers to ask, by name; null asks every provider enabled by default. */
  readonly providers: readonly ProviderIdValue[] | null;
  readonly credentials: Credentials;
  readonly signal: AbortSignal | null;
}
