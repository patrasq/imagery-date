/** The `status` values of the Street View metadata API, and what each means for a lookup. */
export const StreetViewStatus = Object.freeze({
  Ok: 'OK',
  ZeroResults: 'ZERO_RESULTS',
  NotFound: 'NOT_FOUND',
  RequestDenied: 'REQUEST_DENIED',
  OverQueryLimit: 'OVER_QUERY_LIMIT',
  InvalidRequest: 'INVALID_REQUEST',
  UnknownError: 'UNKNOWN_ERROR',
} as const);
