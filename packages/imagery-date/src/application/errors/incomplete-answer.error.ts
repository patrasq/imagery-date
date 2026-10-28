import type { Capture } from '../../domain/capture/capture.interface.ts';
import type { FailureCodeValue } from '../../domain/outcome/failure-code.type.ts';
import { ProviderFailureError } from './provider-failure.error.ts';

/**
 * A provider got part of its answer: the photos it did date, and why the rest is missing. The lookup reports them as
 * a `partial` outcome, so a dated photo is never thrown away because another request of the same provider failed.
 */
export class IncompleteAnswerError extends ProviderFailureError {
  readonly captures: readonly Capture[];

  constructor(captures: readonly Capture[], code: FailureCodeValue, detail: string) {
    super(code, detail);
    this.captures = captures;
  }
}
