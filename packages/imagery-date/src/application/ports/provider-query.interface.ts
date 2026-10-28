import type { GeoPoint } from '../../domain/geo/geo-point.value-object.ts';
import type { ZoomLevel } from '../../domain/geo/zoom-level.value-object.ts';
import type { Credentials } from '../../domain/provider/credentials.type.ts';

export interface ProviderQuery {
  readonly point: GeoPoint;
  readonly zoom: ZoomLevel;
  readonly credentials: Credentials;
  readonly signal: AbortSignal | null;
}
