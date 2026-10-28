import { CALENDAR } from '../calendar/calendar.constants.ts';
import { CIVIL_TIME as T } from './civil-time.constants.ts';

const pad = (value: number, digits: number): string => String(value).padStart(digits, CALENDAR.paddingDigit);

function civilDate(daysSinceEpoch: number): string {
  const shifted = daysSinceEpoch + T.epochShiftDays;
  const era = Math.floor(shifted / T.daysPerEra);
  const dayOfEra = shifted - era * T.daysPerEra;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / T.daysPerFourYears) +
      Math.floor(dayOfEra / T.daysPerCentury) -
      Math.floor(dayOfEra / T.lastDayOfEra)) /
      T.daysPerYear,
  );
  const dayOfYear =
    dayOfEra -
    (T.daysPerYear * yearOfEra + Math.floor(yearOfEra / T.leapCycle) - Math.floor(yearOfEra / T.centuryCycle));
  const marchMonth = Math.floor(
    (T.monthsFromMarchMultiplier * dayOfYear + T.monthsFromMarchOffset) / T.daysPerFiveMonths,
  );
  const day =
    dayOfYear -
    Math.floor((T.daysPerFiveMonths * marchMonth + T.monthsFromMarchOffset) / T.monthsFromMarchMultiplier) +
    1;
  const month = marchMonth < T.marchBasedJanuary ? marchMonth + T.marchOffset : marchMonth - T.januaryOffset;
  const year = yearOfEra + era * T.yearsPerEra + (month <= T.february ? 1 : 0);
  return [pad(year, CALENDAR.yearDigits), pad(month, CALENDAR.monthDigits), pad(day, CALENDAR.dayDigits)].join(
    CALENDAR.isoSeparator,
  );
}

function civilTime(millisecondsOfDay: number): string {
  const hours = Math.floor(millisecondsOfDay / T.millisecondsPerHour);
  const minutes = Math.floor((millisecondsOfDay % T.millisecondsPerHour) / T.millisecondsPerMinute);
  const seconds = Math.floor((millisecondsOfDay % T.millisecondsPerMinute) / T.millisecondsPerSecond);
  const clock = [pad(hours, T.timeDigits), pad(minutes, T.timeDigits), pad(seconds, T.timeDigits)].join(
    T.timeSeparator,
  );
  return [clock, pad(millisecondsOfDay % T.millisecondsPerSecond, T.millisecondDigits)].join(T.fractionSeparator);
}

/** ISO 8601 in UTC (`2026-10-28T13:05:00.000Z`) of milliseconds since 1970-01-01T00:00:00Z, without `Date`. */
export function isoInstant(epochMilliseconds: number): string {
  const whole = Math.floor(epochMilliseconds);
  const days = Math.floor(whole / T.millisecondsPerDay);
  const time = civilTime(whole - days * T.millisecondsPerDay);
  return [civilDate(days), T.dateTimeSeparator, time, T.utcDesignator].join('');
}
