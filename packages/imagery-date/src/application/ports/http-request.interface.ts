import type { HttpMethodValue } from './http-method.type.ts';

export interface HttpRequest {
  readonly method: HttpMethodValue;
  readonly url: URL;
  /** Cancels the request when the caller cancels the lookup. */
  readonly signal: AbortSignal | null;
  /** Overrides the client's per-attempt timeout, for services known to be slow. */
  readonly timeoutMilliseconds?: number;
}
