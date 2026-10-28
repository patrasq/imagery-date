import { DOMAIN_ERRORS_COPY } from './domain-errors.copy.ts';
import { ErrorCode } from './error-code.enum.ts';
import { ImageryDateError } from './imagery-date.error.ts';

export class InvalidZoomError extends ImageryDateError {
  override readonly code = ErrorCode.InvalidZoom;

  constructor(zoom: number, maximum: number) {
    super(DOMAIN_ERRORS_COPY.invalidZoom(zoom, maximum));
  }
}
