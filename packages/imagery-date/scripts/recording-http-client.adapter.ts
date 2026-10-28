import { ProviderFailureError } from '../src/application/errors/provider-failure.error.ts';
import { HttpClient } from '../src/application/ports/http-client.port.ts';
import type { HttpRequest } from '../src/application/ports/http-request.interface.ts';
import type { HttpResponse } from '../src/application/ports/http-response.interface.ts';
import type { RecordedExchange } from '../src/testing/recorded-exchange.interface.ts';
import { redactedUrl } from '../src/testing/redacted-url.function.ts';
import { RECORDING } from './recording.constants.ts';

const keptHeaders = (headers: ReadonlyMap<string, string>): Record<string, string> =>
  Object.fromEntries([...headers].filter(([name]) => RECORDING.keptHeaders.has(name)));

/** Passes requests to the real network and keeps every exchange, secrets removed from the URLs. */
export class RecordingHttpClient extends HttpClient {
  readonly exchanges: RecordedExchange[] = [];
  readonly #inner: HttpClient;

  constructor(inner: HttpClient) {
    super();
    this.#inner = inner;
  }

  override async send(request: HttpRequest): Promise<HttpResponse> {
    const recorded = { method: request.method, url: redactedUrl(request.url) };
    try {
      const response = await this.#inner.send(request);
      const kept = { status: response.status, headers: keptHeaders(response.headers), body: response.body };
      this.exchanges.push({ request: recorded, response: kept, failure: null });
      return response;
    } catch (error: unknown) {
      if (error instanceof ProviderFailureError)
        this.exchanges.push({ request: recorded, response: null, failure: error.failure });
      throw error;
    }
  }
}
