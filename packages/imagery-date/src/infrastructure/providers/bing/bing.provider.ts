import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { TileCoordinate } from '../../../domain/geo/tile-coordinate.value-object.ts';
import { ZoomRange } from '../../../domain/geo/zoom-range.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { HTTP } from '../../http/http.constants.ts';
import { HTTP_COPY } from '../../http/http.copy.ts';
import { BING } from './bing.constants.ts';
import { bingCaptureRange } from './bing-capture-range.function.ts';

/**
 * The capture range Bing states for the aerial tile at the point, read from the tile's headers with a HEAD request
 * (Bing exposes them to browsers on purpose). The zoom is capped at 19, where Bing's aerial layer is complete.
 */
export class BingProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = BING.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const zoom = query.zoom.atMost(BING.maximumZoom);
    const url = new URL(BING.tileUrlStart + TileCoordinate.containing(query.point, zoom).quadkey() + BING.tileUrlEnd);
    url.searchParams.set(BING.generationParameter, BING.generation);
    const response = await this.#http.send({ method: HttpMethod.Head, url, signal: query.signal });
    if (BING.noTileStatuses.has(response.status)) return [];
    if (response.status < HTTP.successMinimum || response.status > HTTP.successMaximum) {
      throw new ProviderFailureError(FailureCode.HttpStatus, HTTP_COPY.status(url.host, response.status));
    }
    const header = response.headers.get(BING.captureRangeHeader);
    if (header === undefined) return [];
    return [
      {
        provider: BING.descriptor.id,
        date: bingCaptureRange(header),
        product: null,
        resolutionMetres: null,
        zoomRange: ZoomRange.only(zoom),
        distanceMetres: null,
        publishedOn: null,
        attribution: BING.descriptor.attribution,
      },
    ];
  }
}
