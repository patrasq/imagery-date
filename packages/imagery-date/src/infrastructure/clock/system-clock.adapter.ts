import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import { Clock } from '../../application/ports/clock.port.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import type { Instant } from '../../domain/time/instant.interface.ts';
import { isoInstant } from '../../domain/time/iso-instant.function.ts';
import { CLOCK } from './clock.constants.ts';

const aborted = (): ProviderFailureError => new ProviderFailureError(FailureCode.Aborted, CLOCK.aborted);

/** The real clock: the only place that reads the time or waits on a timer (CONTRIBUTING.md rule C9). */
export class SystemClock extends Clock {
  override now(): Instant {
    const epochMilliseconds = Date.now();
    return { epochMilliseconds, iso: isoInstant(epochMilliseconds) };
  }

  override wait(milliseconds: number, signal: AbortSignal | null): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted === true) {
        reject(aborted());
        return;
      }
      const onAbort = (): void => {
        clearTimeout(timer);
        reject(aborted());
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener(CLOCK.abortEvent, onAbort);
        resolve();
      }, milliseconds);
      signal?.addEventListener(CLOCK.abortEvent, onAbort, { once: true });
    });
  }
}
