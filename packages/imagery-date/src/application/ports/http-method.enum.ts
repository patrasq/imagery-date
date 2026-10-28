/** The only methods providers are called with: every lookup reads, none writes. */
export const HttpMethod = Object.freeze({
  Get: 'GET',
  /** Headers only: Bing states its capture dates in tile headers, so the photo itself is never downloaded. */
  Head: 'HEAD',
} as const);
