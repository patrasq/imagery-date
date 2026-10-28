import { CALENDAR } from '../calendar/calendar.constants.ts';
import { CalendarDay } from '../calendar/calendar-day.value-object.ts';
import { InvalidDateRangeError } from '../errors/invalid-date-range.error.ts';
import { CAPTURE_DATE_FORMATS } from './capture-date-formats.map.ts';
import { DatePrecision } from './date-precision.enum.ts';
import type { DatePrecisionValue } from './date-precision.type.ts';

/**
 * When a photo was taken, at the precision its provider states. `start` and `end` are the first and last
 * day it can have been, so dates of any precision sort and compare.
 */
export class CaptureDate {
  readonly precision: DatePrecisionValue;
  readonly start: CalendarDay;
  readonly end: CalendarDay;

  private constructor(precision: DatePrecisionValue, start: CalendarDay, end: CalendarDay) {
    this.precision = precision;
    this.start = start;
    this.end = end;
  }

  static day(day: CalendarDay): CaptureDate {
    return new CaptureDate(DatePrecision.Day, day, day);
  }

  static month(year: number, month: number): CaptureDate {
    return new CaptureDate(
      DatePrecision.Month,
      CalendarDay.firstOfMonth(year, month),
      CalendarDay.lastOfMonth(year, month),
    );
  }

  static year(year: number): CaptureDate {
    return new CaptureDate(
      DatePrecision.Year,
      CalendarDay.firstOfMonth(year, 1),
      CalendarDay.lastOfMonth(year, CALENDAR.monthsPerYear),
    );
  }

  /** A range whose ends are the same day is that day. @throws InvalidDateRangeError when it ends before it starts. */
  static range(start: CalendarDay, end: CalendarDay): CaptureDate {
    const order = start.compare(end);
    if (order > 0) throw new InvalidDateRangeError(start.toIsoString(), end.toIsoString());
    return order === 0 ? CaptureDate.day(start) : new CaptureDate(DatePrecision.Range, start, end);
  }

  /** ISO 8601 text at this date's precision: `2024-08-27`, `2021-06`, `2025` or `2021-06-16/2021-10-08`. */
  get value(): string {
    return CAPTURE_DATE_FORMATS[this.precision](this.start, this.end);
  }

  /** Positive when this photo is the later one: by last possible day, then by first possible day. */
  compare(other: CaptureDate): number {
    return this.end.compare(other.end) || this.start.compare(other.start);
  }

  equals(other: CaptureDate): boolean {
    return this.precision === other.precision && this.compare(other) === 0;
  }

  toJSON(): { value: string; precision: DatePrecisionValue; start: string; end: string } {
    return {
      value: this.value,
      precision: this.precision,
      start: this.start.toIsoString(),
      end: this.end.toIsoString(),
    };
  }
}
