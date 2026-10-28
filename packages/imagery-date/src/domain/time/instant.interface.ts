/** A moment in UTC, as the Clock port reads it. */
export interface Instant {
  readonly epochMilliseconds: number;
  /** ISO 8601 in UTC: `2026-10-28T13:05:00.000Z`. */
  readonly iso: string;
}
