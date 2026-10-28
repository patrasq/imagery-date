import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { HTTP } from './http.constants.ts';
import { HTTP_COPY } from './http.copy.ts';

/**
 * The work, or an `aborted` failure as soon as the signal fires. The work itself carries on: callers sharing it
 * (one cached request awaited by many lookups) are not cancelled by one of them giving up.
 */
export function abortable<T>(work: Promise<T>, signal: AbortSignal | null): Promise<T> {
  if (signal === null) return work;
  const failure = (): ProviderFailureError => new ProviderFailureError(FailureCode.Aborted, HTTP_COPY.aborted);
  if (signal.aborted) return Promise.reject(failure());
  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => {
      reject(failure());
    };
    signal.addEventListener(HTTP.abortEvent, onAbort, { once: true });
    work.then(
      (value) => {
        signal.removeEventListener(HTTP.abortEvent, onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener(HTTP.abortEvent, onAbort);
        reject(error instanceof Error ? error : failure());
      },
    );
  });
}
