import type { Clock } from '../application/ports/clock.port.ts';
import type { HttpClient } from '../application/ports/http-client.port.ts';
import type { RandomSource } from '../application/ports/random-source.port.ts';
import { CachingHttpClient } from '../infrastructure/http/caching-http-client.adapter.ts';
import { FetchHttpClient } from '../infrastructure/http/fetch-http-client.adapter.ts';
import { HTTP } from '../infrastructure/http/http.constants.ts';
import { RetryingHttpClient } from '../infrastructure/http/retrying-http-client.adapter.ts';
import { ThrottledHttpClient } from '../infrastructure/http/throttled-http-client.adapter.ts';
import type { ImageryDateClientOptions } from './imagery-date-client-options.interface.ts';

/**
 * cache → retry → per-host limit → fetch. The cache answers repeats before they take a slot; the limit is inside the
 * retries, so a request waiting out its backoff does not hold a slot.
 */
export function defaultHttpClient(options: ImageryDateClientOptions, clock: Clock, random: RandomSource): HttpClient {
  const fetcher = new FetchHttpClient({
    timeoutMilliseconds: options.timeoutMilliseconds ?? HTTP.timeoutMilliseconds,
    userAgent: options.userAgent ?? null,
  });
  const throttled = new ThrottledHttpClient(fetcher, options.requestsPerHost ?? HTTP.concurrentRequestsPerHost);
  const retrying = new RetryingHttpClient(throttled, clock, random);
  return new CachingHttpClient(retrying, options.cacheEntries ?? HTTP.cacheEntries);
}
