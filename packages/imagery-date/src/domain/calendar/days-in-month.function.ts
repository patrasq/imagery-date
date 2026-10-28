import { CALENDAR as C } from './calendar.constants.ts';

const isLeapYear = (year: number): boolean =>
  year % C.gregorianCycle === 0 || (year % C.leapCycle === 0 && year % C.centuryCycle !== 0);

/** Days in a month of the proleptic Gregorian calendar; 0 for a month outside 1..12. */
export function daysInMonth(year: number, month: number): number {
  if (month === C.february && isLeapYear(year)) return C.leapDay;
  return C.daysPerMonth[month - 1] ?? 0;
}
