/** What happened when one provider was asked about one point. */
export const OutcomeStatus = Object.freeze({
  /** It answered with at least one dated photo. */
  Found: 'found',
  /** It answered with dated photos, but part of its answer is missing; `failure` says which part and why. */
  Partial: 'partial',
  /** It answered, and it has no dated photo at this point. */
  NoDate: 'no-date',
  /** The point lies outside the area it covers, so it was not called. */
  OutsideCoverage: 'outside-coverage',
  /** It was not called: its key is missing. */
  Skipped: 'skipped',
  /** It was called and did not answer usefully; the other providers' answers stand. */
  Failed: 'failed',
} as const);
