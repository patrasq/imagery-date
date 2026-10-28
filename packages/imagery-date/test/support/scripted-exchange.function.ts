import type { HttpMethodValue } from '../../src/application/ports/http-method.type.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';

/** A hand-written exchange, for answers the real services cannot be made to give on demand (errors, odd shapes). */
export function scriptedExchange(
  request: { method: HttpMethodValue; url: string },
  status: number,
  body: string,
  headers: Readonly<Record<string, string>> = {},
): RecordedExchange {
  return { request, response: { status, headers, body }, failure: null };
}
