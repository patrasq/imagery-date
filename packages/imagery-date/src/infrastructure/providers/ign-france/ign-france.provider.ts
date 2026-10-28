import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import type { GeoPoint } from '../../../domain/geo/geo-point.value-object.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { readJson } from '../../http/read-json.function.ts';
import { IGN_FRANCE as I } from './ign-france.constants.ts';
import { ignMosaicResponseSchema } from './ign-mosaic-response.schema.ts';
import { toIgnCaptures } from './to-ign-captures.function.ts';

const mosaicUrl = (point: GeoPoint): URL => {
  const url = new URL(I.wfsUrl);
  for (const [name, value] of Object.entries(I.parameters)) url.searchParams.set(name, value);
  const half = I.boxHalfSideDegrees;
  const box = [point.latitude - half, point.longitude - half, point.latitude + half, point.longitude + half];
  url.searchParams.set(I.bboxParameter, [...box, I.bboxCrs].join(I.listSeparator));
  return url;
};

/**
 * The day IGN flew the BD ORTHO photo at the point, from the orthophoto's mosaic graph: the open French national
 * aerial survey, 20 cm, renewed every three years per département. One request per point.
 */
export class IgnFranceProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = I.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const url = mosaicUrl(query.point);
    const response = await this.#http.send({ method: HttpMethod.Get, url, signal: query.signal });
    const mosaic = readJson(response, url.host, ignMosaicResponseSchema);
    return toIgnCaptures(mosaic.features, url.host);
  }
}
