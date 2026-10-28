import { GEO } from './geo.constants.ts';
import type { GeoPoint } from './geo-point.value-object.ts';

const radians = (degrees: number): number => (degrees * Math.PI) / GEO.degreesPerHalfTurn;

/** Great-circle distance between two points (haversine on a sphere of the mean Earth radius). */
export function distanceInMetres(from: GeoPoint, to: GeoPoint): number {
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const halfChord =
    Math.sin(latitudeDelta * GEO.half) ** GEO.two +
    Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta * GEO.half) ** GEO.two;
  return GEO.two * GEO.meanEarthRadiusMetres * Math.asin(Math.min(1, Math.sqrt(halfChord)));
}
