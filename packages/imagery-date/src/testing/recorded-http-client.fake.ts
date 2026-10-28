import { ProviderFailureError } from '../application/errors/provider-failure.error.ts';
import { HttpClient } from '../application/ports/http-client.port.ts';
import type { HttpRequest } from '../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../application/ports/http-response.interface.ts';
import type { RecordedExchange } from './recorded-exchange.interface.ts';
import { recordingKey } from './recording-key.function.ts';
import { UnrecordedRequestError } from './unrecorded-request.error.ts';

const replay = (exchange: RecordedExchange): HttpResponse => {
  if (exchange.response === null) {
    const failure = exchange.failure;
    throw failure === null
      ? new UnrecordedRequestError(exchange.request.url, [])
      : new ProviderFailureError(failure.code, failure.detail);
  }
  const headers = new Map(
    Object.entries(exchange.response.headers).map(([name, value]) => [name.toLowerCase(), value]),
  );
  return { status: exchange.response.status, headers, body: exchange.response.body };
};

/**
 * Answers requests from recorded exchanges, without the network. Exchanges for the same request are returned in
 * order, the last one repeating, so a test can script "503, then 200". Every request sent is kept in `sent`.
 */
export class RecordedHttpClient extends HttpClient {
  readonly sent: HttpRequest[] = [];
  readonly #queues = new Map<string, RecordedExchange[]>();

  constructor(exchanges: readonly RecordedExchange[]) {
    super();
    for (const exchange of exchanges) {
      const key = recordingKey(exchange.request.method, exchange.request.url);
      this.#queues.set(key, [...(this.#queues.get(key) ?? []), exchange]);
    }
  }

  override send(request: HttpRequest): Promise<HttpResponse> {
    this.sent.push(request);
    const key = recordingKey(request.method, request.url);
    const queue = this.#queues.get(key);
    const exchange = queue && queue.length > 1 ? queue.shift() : queue?.[0];
    if (exchange === undefined) return Promise.reject(new UnrecordedRequestError(key, [...this.#queues.keys()]));
    try {
      return Promise.resolve(replay(exchange));
    } catch (error: unknown) {
      return Promise.reject(error instanceof Error ? error : new UnrecordedRequestError(key, []));
    }
  }
}
