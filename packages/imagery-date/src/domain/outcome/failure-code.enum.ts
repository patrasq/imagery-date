/** Why a provider did not answer usefully. Branch on these, never on `detail`. */
export const FailureCode = Object.freeze({
  /** No answer within the time limit, after the retries. */
  Timeout: 'timeout',
  /** The connection failed (DNS, TLS, reset, or a browser's CORS refusal). */
  Network: 'network',
  /** The caller cancelled the lookup. */
  Aborted: 'aborted',
  /** It answered with an HTTP status that carries no data, after the retries. */
  HttpStatus: 'http-status',
  /** It answered in a shape this library does not know: the provider changed its service. */
  InvalidResponse: 'invalid-response',
  /** It refused the key (invalid, not enabled for this API, or over quota). */
  Refused: 'refused',
  /** Its key was not supplied. */
  MissingCredential: 'missing-credential',
  /** Anything else; `detail` says what. */
  Unexpected: 'unexpected',
} as const);
