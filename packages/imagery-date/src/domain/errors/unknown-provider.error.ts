import { DOMAIN_ERRORS_COPY } from './domain-errors.copy.ts';
import { ErrorCode } from './error-code.enum.ts';
import { ImageryDateError } from './imagery-date.error.ts';

export class UnknownProviderError extends ImageryDateError {
  override readonly code = ErrorCode.UnknownProvider;

  constructor(name: string, known: readonly string[]) {
    super(DOMAIN_ERRORS_COPY.unknownProvider(name, known));
  }
}
