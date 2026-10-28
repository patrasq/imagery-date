import { HttpClient } from '../../application/ports/http-client.port.ts';
import type { HttpRequest } from '../../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import { KeyedSemaphore } from './keyed-semaphore.service.ts';

/** At most `perHost` requests in flight to any one host, however many lookups run at once. */
export class ThrottledHttpClient extends HttpClient {
  readonly #inner: HttpClient;
  readonly #semaphore: KeyedSemaphore;

  constructor(inner: HttpClient, perHost: number) {
    super();
    this.#inner = inner;
    this.#semaphore = new KeyedSemaphore(perHost);
  }

  override send(request: HttpRequest): Promise<HttpResponse> {
    return this.#semaphore.run(request.url.host, request.signal, () => this.#inner.send(request));
  }
}
