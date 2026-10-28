import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import type { RandomSource } from '../../application/ports/random-source.port.ts';
import { HTTP } from './http.constants.ts';

const retryAfterMilliseconds = (response: HttpResponse | null): number | null => {
  const header = response?.headers.get(HTTP.retryAfterHeader);
  if (header === undefined) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * HTTP.millisecondsPerSecond : null;
};

/**
 * How long to wait before attempt `attempt + 1`: the server's Retry-After in seconds when it sends one, otherwise
 * full-jitter exponential backoff, so many clients retrying together spread out instead of arriving in waves.
 */
export function retryDelay(attempt: number, response: HttpResponse | null, random: RandomSource): number {
  const told = retryAfterMilliseconds(response);
  if (told !== null) return told;
  const ceiling = Math.min(
    HTTP.backoffMaximumMilliseconds,
    HTTP.backoffBaseMilliseconds * HTTP.backoffGrowth ** (attempt - 1),
  );
  return Math.floor(random.next() * ceiling);
}
