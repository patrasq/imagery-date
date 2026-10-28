import { ProviderFailureError } from '../application/errors/provider-failure.error.ts';
import { Clock } from '../application/ports/clock.port.ts';
import { FailureCode } from '../domain/outcome/failure-code.enum.ts';
import type { Instant } from '../domain/time/instant.interface.ts';
import { isoInstant } from '../domain/time/iso-instant.function.ts';
import { TESTING } from './testing.constants.ts';
import { TESTING_COPY } from './testing.copy.ts';

/** A clock that only moves when something waits on it, by exactly the wait. Waits resolve at once and are kept. */
export class FixedClock extends Clock {
  readonly waits: number[] = [];
  #epochMilliseconds: number;

  constructor(epochMilliseconds: number = TESTING.defaultEpochMilliseconds) {
    super();
    this.#epochMilliseconds = epochMilliseconds;
  }

  override now(): Instant {
    return { epochMilliseconds: this.#epochMilliseconds, iso: isoInstant(this.#epochMilliseconds) };
  }

  override wait(milliseconds: number, signal: AbortSignal | null): Promise<void> {
    if (signal?.aborted === true) {
      return Promise.reject(new ProviderFailureError(FailureCode.Aborted, TESTING_COPY.aborted));
    }
    this.waits.push(milliseconds);
    this.#epochMilliseconds += milliseconds;
    return Promise.resolve();
  }
}
