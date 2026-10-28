/**
 * How exactly a provider states when a photo was taken. A capture date is never shown more precisely than this:
 * a provider that publishes only a year yields a year, never a guessed day.
 */
export const DatePrecision = Object.freeze({
  Day: 'day',
  Month: 'month',
  Year: 'year',
  /** The photo was taken on some day between two dates (Bing's capture range). */
  Range: 'range',
} as const);
