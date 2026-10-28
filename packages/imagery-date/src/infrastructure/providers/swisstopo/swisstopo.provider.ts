import type * as z from 'zod/mini';
import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import type { GeoPoint } from '../../../domain/geo/geo-point.value-object.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { readJson } from '../../http/read-json.function.ts';
import { SWISSTOPO as S } from './swisstopo.constants.ts';
import { swisstopoIdentifyResponseSchema } from './swisstopo-identify-response.schema.ts';
import type { swisstopoSheetSchema } from './swisstopo-sheet.schema.ts';

type Sheet = z.infer<typeof swisstopoSheetSchema>;

const identifyUrl = (point: GeoPoint): URL => {
  const url = new URL(S.identifyUrl);
  for (const [name, value] of Object.entries(S.parameters)) url.searchParams.set(name, value);
  const half = S.extentHalfSideDegrees;
  const extent = [point.longitude - half, point.latitude - half, point.longitude + half, point.latitude + half];
  url.searchParams.set(S.geometryParameter, [point.longitude, point.latitude].join(S.listSeparator));
  url.searchParams.set(S.mapExtentParameter, extent.join(S.listSeparator));
  return url;
};

const metres = (resolution: string | null | undefined): number | null => {
  const match = S.centimetres.exec(resolution?.trim() ?? '');
  return match === null ? null : Number(match[1]) / S.centimetresPerMetre;
};

const toCapture = (sheet: Sheet): Capture | null => {
  const year = Number(sheet.datenstand);
  if (!Number.isInteger(year)) return null;
  return {
    provider: S.descriptor.id,
    date: CaptureDate.year(year),
    product: S.productName,
    resolutionMetres: metres(sheet.resolution),
    zoomRange: null,
    distanceMetres: null,
    publishedOn: null,
    attribution: S.descriptor.attribution,
  };
};

/**
 * The year swisstopo flew the SWISSIMAGE 10 cm photo at the point, from the orthophoto's sheet metadata. swisstopo
 * publishes the year only, so the date is a year. One request per point.
 */
export class SwisstopoProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = S.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const url = identifyUrl(query.point);
    const response = await this.#http.send({ method: HttpMethod.Get, url, signal: query.signal });
    const sheets = readJson(response, url.host, swisstopoIdentifyResponseSchema).results;
    return sheets.flatMap((result) => toCapture(result.attributes) ?? []);
  }
}
