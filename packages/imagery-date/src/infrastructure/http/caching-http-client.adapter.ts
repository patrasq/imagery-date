import { HttpClient } from '../../application/ports/http-client.port.ts';
import type { HttpRequest } from '../../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import { abortable } from './abortable.function.ts';
import { HTTP } from './http.constants.ts';

/**
 * Sends each distinct request once: identical requests in flight share one answer, and final answers (2xx, 404, 410)
 * are kept, least recently used dropped first. The shared request is not tied to any caller's signal; each caller
 * stops waiting when its own signal fires, without cancelling the others.
 */
export class CachingHttpClient extends HttpClient {
  readonly #inner: HttpClient;
  readonly #capacity: number;
  readonly #entries = new Map<string, Promise<HttpResponse>>();

  constructor(inner: HttpClient, capacity: number) {
    super();
    this.#inner = inner;
    this.#capacity = Math.max(1, Math.floor(capacity));
  }

  override send(request: HttpRequest): Promise<HttpResponse> {
    const key = [request.method, request.url.href].join(HTTP.keySeparator);
    const known = this.#entries.get(key);
    if (known !== undefined) {
      this.#entries.delete(key);
      this.#entries.set(key, known);
      return abortable(known, request.signal);
    }
    const shared = this.#inner.send({ ...request, signal: null });
    this.#store(key, shared);
    return abortable(shared, request.signal);
  }

  #store(key: string, shared: Promise<HttpResponse>): void {
    this.#entries.set(key, shared);
    const forget = (): void => {
      if (this.#entries.get(key) === shared) this.#entries.delete(key);
    };
    shared.then((response) => {
      if (!HTTP.cacheableStatuses.has(response.status)) forget();
    }, forget);
    for (const oldest of this.#entries.keys()) {
      if (this.#entries.size <= this.#capacity) break;
      this.#entries.delete(oldest);
    }
  }
}
