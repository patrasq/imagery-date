import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { CredentialKind } from '../../../domain/provider/credential-kind.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { HTTP_COPY } from '../../http/http.copy.ts';
import { readJson } from '../../http/read-json.function.ts';
import { buildingInsightsResponseSchema } from './building-insights-response.schema.ts';
import { GOOGLE_SOLAR as G } from './google-solar.constants.ts';
import { toSolarCapture } from './to-solar-capture.function.ts';

/**
 * The day of the aerial photo Google's Solar API analysed for the building nearest the point. Billable: it runs only
 * when asked for by name, with the caller's own key.
 */
export class GoogleSolarProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = G.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const url = new URL(G.findClosestUrl);
    url.searchParams.set(G.latitudeParameter, String(query.point.latitude));
    url.searchParams.set(G.longitudeParameter, String(query.point.longitude));
    url.searchParams.set(G.qualityParameter, G.minimumQuality);
    url.searchParams.set(G.fieldsParameter, G.fields);
    url.searchParams.set(G.keyParameter, query.credentials[CredentialKind.Google] ?? '');
    const response = await this.#http.send({ method: HttpMethod.Get, url, signal: query.signal });
    if (response.status === G.noBuildingStatus) return [];
    if (G.refusedStatuses.has(response.status)) {
      throw new ProviderFailureError(FailureCode.Refused, HTTP_COPY.status(url.host, response.status));
    }
    const insights = readJson(response, url.host, buildingInsightsResponseSchema);
    return [toSolarCapture(insights, query.point)];
  }
}
