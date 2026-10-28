/** Proleptic Gregorian calendar rules and ISO 8601 date formatting. */
export const CALENDAR = Object.freeze({
  /** No photo a provider dates here is older than this; anything earlier is a parsing error. */
  minimumYear: 1800,
  maximumYear: 9999,
  monthsPerYear: 12,
  /** Days per month in a common year, January first. */
  daysPerMonth: Object.freeze([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]),
  february: 2,
  leapDay: 29,
  leapCycle: 4,
  centuryCycle: 100,
  gregorianCycle: 400,
  /** 20250321 → year 2025, month 03, day 21. */
  compactYearDivisor: 10_000,
  compactMonthDivisor: 100,
  isoSeparator: '-',
  rangeSeparator: '/',
  yearDigits: 4,
  monthDigits: 2,
  dayDigits: 2,
  paddingDigit: '0',
  /** YYYY-MM-DD, optionally followed by a time or a zone designator, which are ignored. */
  isoDayPattern: /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*|Z)?$/,
} as const);
