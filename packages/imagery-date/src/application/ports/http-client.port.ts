import type { HttpRequest } from './http-request.interface.ts';
import type { HttpResponse } from './http-response.interface.ts';

/**
 * Sends one request and returns whatever status the server answers with. A request that gets no answer (timeout,
 * network failure, cancellation) rejects with a `ProviderFailureError` carrying the matching `FailureCode`.
 */
export abstract class HttpClient {
  abstract send(request: HttpRequest): Promise<HttpResponse>;
}
