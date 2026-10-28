import { DOMAIN_ERRORS_COPY } from './domain-errors.copy.ts';
import { ErrorCode } from './error-code.enum.ts';
import { ImageryDateError } from './imagery-date.error.ts';

export class InvalidCalendarDayError extends ImageryDateError {
  override readonly code = ErrorCode.InvalidCalendarDay;

  constructor(text: string) {
    super(DOMAIN_ERRORS_COPY.invalidCalendarDay(text));
  }
}
