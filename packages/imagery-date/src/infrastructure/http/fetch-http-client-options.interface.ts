export interface FetchHttpClientOptions {
  readonly timeoutMilliseconds: number;
  /** Sent only where the runtime allows it: browsers forbid the header, and setting it would force a CORS preflight. */
  readonly userAgent: string | null;
}
