import { SystemClock } from '../infrastructure/clock/system-clock.adapter.ts';
import { SystemRandom } from '../infrastructure/random/system-random.adapter.ts';
import { DefaultImageryDateClient } from './default-imagery-date-client.service.ts';
import { defaultHttpClient } from './default-http-client.function.ts';
import { defaultProviderRegistry } from './default-provider-registry.function.ts';
import type { ImageryDateClient } from './imagery-date-client.interface.ts';
import type { ImageryDateClientOptions } from './imagery-date-client-options.interface.ts';

/**
 * A client for every provider over the default HTTP stack: responses cached, identical requests shared, at most four
 * requests per host, timeouts, and retries with backoff. Share one client across lookups to share its cache.
 */
export function createImageryDateClient(options: ImageryDateClientOptions = {}): ImageryDateClient {
  const clock = options.clock ?? new SystemClock();
  const random = options.random ?? new SystemRandom();
  const http = options.httpClient ?? defaultHttpClient(options, clock, random);
  return new DefaultImageryDateClient(defaultProviderRegistry(http), clock, options.credentials ?? {});
}
