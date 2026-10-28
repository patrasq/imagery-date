/** How recordings are keyed and redacted. */
export const TESTING = Object.freeze({
  /** Query parameters that carry secrets: removed before a URL is recorded or matched. */
  redactedParameters: Object.freeze(['key', 'token']),
  keySeparator: ' ',
  /** The moment a FixedClock starts at unless told otherwise. */
  defaultEpochMilliseconds: 1_793_000_000_000,
  defaultRandomValues: Object.freeze([0.5]),
} as const);
