import type * as z from 'zod/mini';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { readJson } from '../../http/read-json.function.ts';
import { ARCGIS_COPY } from './arcgis.copy.ts';
import { arcgisQueryResponseSchema } from './arcgis-query-response.schema.ts';
import type { esriImageryAttributesSchema } from './esri-imagery-attributes.schema.ts';

type Attributes = z.infer<typeof esriImageryAttributesSchema>;

interface EsriImageryQuery {
  readonly url: URL;
  readonly signal: AbortSignal | null;
  readonly timeoutMilliseconds?: number;
}

/** The imagery footprints an ArcGIS layer has at a point. @throws ProviderFailureError when the service errs. */
export async function readEsriImagery(http: HttpClient, query: EsriImageryQuery): Promise<Attributes[]> {
  const host = query.url.host;
  const response = await http.send({ method: HttpMethod.Get, ...query });
  const body = readJson(response, host, arcgisQueryResponseSchema);
  if (body.error !== undefined) {
    throw new ProviderFailureError(
      FailureCode.HttpStatus,
      ARCGIS_COPY.serviceError(host, body.error.code, body.error.message),
    );
  }
  if (body.features === undefined) {
    throw new ProviderFailureError(FailureCode.InvalidResponse, ARCGIS_COPY.missingFeatures(host));
  }
  return body.features.map((feature) => feature.attributes);
}
