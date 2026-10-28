import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { CredentialKind } from '../../../domain/provider/credential-kind.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { readJson } from '../../http/read-json.function.ts';
import { GOOGLE_STREET_VIEW as G } from './google-street-view.constants.ts';
import { GOOGLE_STREET_VIEW_COPY } from './google-street-view.copy.ts';
import { streetViewMetadataResponseSchema } from './street-view-metadata-response.schema.ts';
import { STREET_VIEW_STATUS_OUTCOMES } from './street-view-status-outcomes.map.ts';
import { toStreetViewCapture } from './to-street-view-capture.function.ts';

/**
 * The month (or year) Google photographed the nearest outdoor Street View panorama within 50 m of the point. A
 * street-level photo, not an aerial one; free per Google's documentation, called with the caller's own key.
 */
export class GoogleStreetViewProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = G.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const url = new URL(G.metadataUrl);
    for (const [name, value] of Object.entries(G.parameters)) url.searchParams.set(name, value);
    url.searchParams.set(G.locationParameter, [query.point.latitude, query.point.longitude].join(G.listSeparator));
    url.searchParams.set(G.keyParameter, query.credentials[CredentialKind.Google] ?? '');
    const response = await this.#http.send({ method: HttpMethod.Get, url, signal: query.signal });
    const metadata = readJson(response, url.host, streetViewMetadataResponseSchema);
    const known = Object.hasOwn(STREET_VIEW_STATUS_OUTCOMES, metadata.status);
    const failure = known ? (STREET_VIEW_STATUS_OUTCOMES[metadata.status] ?? null) : FailureCode.InvalidResponse;
    if (failure !== null) {
      throw new ProviderFailureError(failure, GOOGLE_STREET_VIEW_COPY.status(metadata.status, metadata.error_message));
    }
    const capture = toStreetViewCapture(metadata, query.point);
    return capture === null ? [] : [capture];
  }
}
