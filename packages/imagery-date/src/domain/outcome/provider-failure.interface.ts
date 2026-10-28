import type { FailureCodeValue } from './failure-code.type.ts';

export interface ProviderFailure {
  readonly code: FailureCodeValue;
  /** For people: the status, the error or the field that did not match. */
  readonly detail: string;
}
