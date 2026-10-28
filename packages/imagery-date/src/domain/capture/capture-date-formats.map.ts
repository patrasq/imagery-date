import { CALENDAR } from '../calendar/calendar.constants.ts';
import type { CalendarDay } from '../calendar/calendar-day.value-object.ts';
import { DatePrecision } from './date-precision.enum.ts';
import type { DatePrecisionValue } from './date-precision.type.ts';

type Format = (start: CalendarDay, end: CalendarDay) => string;

/** The ISO 8601 text of a capture date at each precision: 2024-08-27, 2021-06, 2025, 2021-06-16/2021-10-08. */
export const CAPTURE_DATE_FORMATS: Readonly<Record<DatePrecisionValue, Format>> = Object.freeze({
  [DatePrecision.Day]: (start) => start.toIsoString(),
  [DatePrecision.Month]: (start) => start.toIsoMonthString(),
  [DatePrecision.Year]: (start) => String(start.year),
  [DatePrecision.Range]: (start, end) => [start.toIsoString(), end.toIsoString()].join(CALENDAR.rangeSeparator),
});
