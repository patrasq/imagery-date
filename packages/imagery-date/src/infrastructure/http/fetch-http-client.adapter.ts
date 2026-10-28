import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import { HttpClient } from '../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../application/ports/http-method.enum.ts';
import type { HttpRequest } from '../../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { HTTP } from './http.constants.ts';
import { HTTP_COPY } from './http.copy.ts';
import type { FetchHttpClientOptions } from './fetch-http-client-options.interface.ts';

/** The network, through the runtime's `fetch`: the only place that calls it (CONTRIBUTING.md rule C10). */
export class FetchHttpClient extends HttpClient {
  readonly #options: FetchHttpClientOptions;

  constructor(options: FetchHttpClientOptions) {
    super();
    this.#options = options;
  }

  override async send(request: HttpRequest): Promise<HttpResponse> {
    const limit = request.timeoutMilliseconds ?? this.#options.timeoutMilliseconds;
    const timeout = AbortSignal.timeout(limit);
    const signal = request.signal === null ? timeout : AbortSignal.any([timeout, request.signal]);
    const init: RequestInit = { method: request.method, signal, redirect: HTTP.redirect };
    if (this.#options.userAgent !== null) init.headers = { [HTTP.userAgentHeader]: this.#options.userAgent };
    try {
      const response = await fetch(request.url, init);
      const body = request.method === HttpMethod.Head ? '' : await response.text();
      const headers = new Map<string, string>();
      response.headers.forEach((value, name) => headers.set(name.toLowerCase(), value));
      return { status: response.status, headers, body };
    } catch (error: unknown) {
      throw this.#failure(error, request, { timeout, limit });
    }
  }

  #failure(
    error: unknown,
    request: HttpRequest,
    deadline: { timeout: AbortSignal; limit: number },
  ): ProviderFailureError {
    const host = request.url.host;
    if (request.signal?.aborted === true) return new ProviderFailureError(FailureCode.Aborted, HTTP_COPY.aborted);
    const timedOut = deadline.timeout.aborted || (error instanceof Error && error.name === HTTP.timeoutErrorName);
    if (timedOut) {
      return new ProviderFailureError(FailureCode.Timeout, HTTP_COPY.timeout(host, deadline.limit));
    }
    const message = error instanceof Error ? error.message : String(error);
    return new ProviderFailureError(FailureCode.Network, HTTP_COPY.network(host, message));
  }
}
