import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import type { Clock } from '../../application/ports/clock.port.ts';
import { HttpClient } from '../../application/ports/http-client.port.ts';
import type { HttpRequest } from '../../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import type { RandomSource } from '../../application/ports/random-source.port.ts';
import { HTTP } from './http.constants.ts';
import { retryDelay } from './retry-delay.function.ts';

type Attempt =
  | { readonly response: HttpResponse; readonly failure: null }
  | { readonly response: null; readonly failure: ProviderFailureError };

const retryable = (attempt: Attempt): boolean =>
  attempt.response === null
    ? HTTP.retryableFailures.has(attempt.failure.failure.code)
    : HTTP.retryableStatuses.has(attempt.response.status);

/**
 * Retries what can succeed on a second try (timeouts, connection failures, 429 and 5xx) with backoff. A response that
 * is still unsuccessful after the last attempt is returned as is; a failure is rethrown.
 */
export class RetryingHttpClient extends HttpClient {
  readonly #inner: HttpClient;
  readonly #clock: Clock;
  readonly #random: RandomSource;

  constructor(inner: HttpClient, clock: Clock, random: RandomSource) {
    super();
    this.#inner = inner;
    this.#clock = clock;
    this.#random = random;
  }

  override async send(request: HttpRequest): Promise<HttpResponse> {
    for (let number = 1; ; number += 1) {
      const attempt = await this.#attempt(request);
      const delay = retryDelay(number, attempt.response, this.#random);
      const giveUp = number >= HTTP.attempts || !retryable(attempt) || delay > HTTP.retryAfterMaximumMilliseconds;
      if (giveUp) return this.#settle(attempt);
      await this.#clock.wait(delay, request.signal);
    }
  }

  async #attempt(request: HttpRequest): Promise<Attempt> {
    try {
      return { response: await this.#inner.send(request), failure: null };
    } catch (error: unknown) {
      if (error instanceof ProviderFailureError) return { response: null, failure: error };
      throw error;
    }
  }

  #settle(attempt: Attempt): HttpResponse {
    if (attempt.response === null) throw attempt.failure;
    return attempt.response;
  }
}
