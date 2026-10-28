import { DOMAIN_ERRORS_COPY } from './domain-errors.copy.ts';
import { ErrorCode } from './error-code.enum.ts';
import { ImageryDateError } from './imagery-date.error.ts';

export class InvalidCoordinatesError extends ImageryDateError {
  override readonly code = ErrorCode.InvalidCoordinates;

  constructor(latitude: number, longitude: number) {
    super(DOMAIN_ERRORS_COPY.invalidCoordinates(latitude, longitude));
  }
}
