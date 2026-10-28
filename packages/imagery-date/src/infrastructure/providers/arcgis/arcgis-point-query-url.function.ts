import type { GeoPoint } from '../../../domain/geo/geo-point.value-object.ts';
import { ARCGIS as A } from './arcgis.constants.ts';

/** The query of one layer of an ArcGIS MapServer at a point, for the given fields. */
export function arcgisPointQueryUrl(
  serviceUrl: string,
  layer: number,
  point: GeoPoint,
  fields: readonly string[],
): URL {
  const url = new URL([serviceUrl, String(layer), A.queryPath].join(A.pathSeparator));
  const parameters = url.searchParams;
  parameters.set(A.parameters.geometry, [point.longitude, point.latitude].join(A.listSeparator));
  parameters.set(A.parameters.geometryType, A.values.point);
  parameters.set(A.parameters.spatialReference, A.values.wgs84);
  parameters.set(A.parameters.outFields, fields.join(A.listSeparator));
  parameters.set(A.parameters.returnGeometry, A.values.no);
  parameters.set(A.parameters.format, A.values.json);
  return url;
}
