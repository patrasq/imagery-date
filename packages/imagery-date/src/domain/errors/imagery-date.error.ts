import type { ErrorCodeValue } from './error-code.type.ts';

/** Base of every error this library throws for a refused value. Branch on `code`, never on `message`. */
export abstract class ImageryDateError extends Error {
  abstract readonly code: ErrorCodeValue;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
