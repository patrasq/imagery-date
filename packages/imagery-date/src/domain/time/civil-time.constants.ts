/**
 * Constants of Howard Hinnant's days-from-civil algorithm (http://howardhinnant.github.io/date_algorithms.html),
 * which turns days since 1970-01-01 into a Gregorian date with integer arithmetic only.
 */
export const CIVIL_TIME = Object.freeze({
  millisecondsPerDay: 86_400_000,
  millisecondsPerHour: 3_600_000,
  millisecondsPerMinute: 60_000,
  millisecondsPerSecond: 1000,
  /** Days from 0000-03-01 to 1970-01-01. */
  epochShiftDays: 719_468,
  daysPerEra: 146_097,
  daysPerFourYears: 1460,
  daysPerCentury: 36_524,
  lastDayOfEra: 146_096,
  daysPerYear: 365,
  yearsPerEra: 400,
  leapCycle: 4,
  centuryCycle: 100,
  monthsFromMarchMultiplier: 5,
  monthsFromMarchOffset: 2,
  daysPerFiveMonths: 153,
  marchBasedJanuary: 10,
  marchOffset: 3,
  januaryOffset: 9,
  february: 2,
  timeDigits: 2,
  millisecondDigits: 3,
  dateTimeSeparator: 'T',
  timeSeparator: ':',
  fractionSeparator: '.',
  utcDesignator: 'Z',
} as const);
