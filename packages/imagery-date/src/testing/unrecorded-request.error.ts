import { TESTING_COPY } from './testing.copy.ts';

/** A test sent a request its recording does not contain: the code under test changed what it asks for. */
export class UnrecordedRequestError extends Error {
  constructor(key: string, known: readonly string[]) {
    super(TESTING_COPY.unrecordedRequest(key, known));
    this.name = new.target.name;
  }
}
