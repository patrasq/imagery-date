import type { FailureCodeValue } from '../../domain/outcome/failure-code.type.ts';
import type { ProviderFailure } from '../../domain/outcome/provider-failure.interface.ts';

/** Raised inside a lookup when a provider does not answer usefully; it becomes that provider's failed outcome. */
export class ProviderFailureError extends Error {
  readonly failure: ProviderFailure;

  constructor(code: FailureCodeValue, detail: string) {
    super(detail);
    this.name = new.target.name;
    this.failure = { code, detail };
  }
}
