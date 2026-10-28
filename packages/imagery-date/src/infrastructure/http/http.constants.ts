import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';

/** Every limit of the HTTP stack, in one place (CONTRIBUTING.md, Bounded waiting). */
export const HTTP = Object.freeze({
  /** Per attempt, including reading the body. */
  timeoutMilliseconds: 15_000,
  /** Attempts per request, the first included. */
  attempts: 3,
  /** Full-jitter exponential backoff: a random wait up to base × 2^(attempt − 1), capped. */
  backoffBaseMilliseconds: 500,
  backoffMaximumMilliseconds: 8000,
  backoffGrowth: 2,
  /** A Retry-After longer than this is not waited for: the attempt fails instead. */
  retryAfterMaximumMilliseconds: 30_000,
  millisecondsPerSecond: 1000,
  retryableStatuses: new Set([408, 425, 429, 500, 502, 503, 504]),
  retryableFailures: new Set<string>([FailureCode.Timeout, FailureCode.Network]),
  /** Simultaneous requests to one host; below the browser's per-host limit of six. */
  concurrentRequestsPerHost: 4,
  /** Responses kept, least recently used dropped first; a batch then asks a provider once per distinct request. */
  cacheEntries: 5000,
  cacheableStatuses: new Set([200, 203, 204, 404, 410]),
  successMinimum: 200,
  successMaximum: 299,
  retryAfterHeader: 'retry-after',
  userAgentHeader: 'user-agent',
  timeoutErrorName: 'TimeoutError',
  keySeparator: ' ',
  abortEvent: 'abort',
  redirect: 'follow',
} as const);
