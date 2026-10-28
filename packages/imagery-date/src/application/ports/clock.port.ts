import type { Instant } from '../../domain/time/instant.interface.ts';

/** The only source of time: the real clock in production, a fixed one in tests, so tests never sleep. */
export abstract class Clock {
  abstract now(): Instant;

  /** Resolves after the delay; rejects with a `ProviderFailureError` (aborted) when the signal fires first. */
  abstract wait(milliseconds: number, signal: AbortSignal | null): Promise<void>;
}
