import type { Clock } from '../application/ports/clock.port.ts';
import type { HttpClient } from '../application/ports/http-client.port.ts';
import type { RandomSource } from '../application/ports/random-source.port.ts';
import type { Credentials } from '../domain/provider/credentials.type.ts';

export interface ImageryDateClientOptions {
  /** Keys for the providers that need one (`{ google: '…' }`). Kept in memory, sent only to their provider. */
  readonly credentials?: Credentials;
  /** Identifies your program to the services (Node, Deno, Bun). Browsers do not allow it and ignore it. */
  readonly userAgent?: string;
  /** Per request attempt. Default 15 000. */
  readonly timeoutMilliseconds?: number;
  /** Simultaneous requests to one host. Default 4. */
  readonly requestsPerHost?: number;
  /** Responses kept for reuse. Default 5 000. */
  readonly cacheEntries?: number;
  /** Replaces the whole HTTP stack: a proxy, a recorded client in tests. */
  readonly httpClient?: HttpClient;
  readonly clock?: Clock;
  readonly random?: RandomSource;
}
