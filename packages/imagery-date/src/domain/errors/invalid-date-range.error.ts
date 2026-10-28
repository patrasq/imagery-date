import { DOMAIN_ERRORS_COPY } from './domain-errors.copy.ts';
import { ErrorCode } from './error-code.enum.ts';
import { ImageryDateError } from './imagery-date.error.ts';

export class InvalidDateRangeError extends ImageryDateError {
  override readonly code = ErrorCode.InvalidDateRange;

  constructor(start: string, end: string) {
    super(DOMAIN_ERRORS_COPY.invalidDateRange(start, end));
  }
}
