import { InvalidCalendarDayError } from '../errors/invalid-calendar-day.error.ts';
import { CALENDAR as C } from './calendar.constants.ts';
import { daysInMonth } from './days-in-month.function.ts';

const pad = (value: number, digits: number): string => String(value).padStart(digits, C.paddingDigit);
const describe = (year: number, month: number, day: number): string =>
  [pad(year, C.yearDigits), pad(month, C.monthDigits), pad(day, C.dayDigits)].join(C.isoSeparator);

/** A day of the Gregorian calendar, with no time and no zone: the precision providers publish dates in. */
export class CalendarDay {
  readonly year: number;
  readonly month: number;
  readonly day: number;

  private constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /** @throws InvalidCalendarDayError when the day does not exist (2023-02-29) or lies outside 1800..9999. */
  static create(year: number, month: number, day: number): CalendarDay {
    const yearValid = Number.isInteger(year) && year >= C.minimumYear && year <= C.maximumYear;
    const valid = yearValid && Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month);
    if (!valid) throw new InvalidCalendarDayError(describe(year, month, day));
    return new CalendarDay(year, month, day);
  }

  /** Esri's SRC_DATE form: 20250321. */
  static fromCompactNumber(compact: number): CalendarDay {
    const year = Math.trunc(compact / C.compactYearDivisor);
    const month = Math.trunc(compact / C.compactMonthDivisor) % C.compactMonthDivisor;
    return CalendarDay.create(year, month, compact % C.compactMonthDivisor);
  }

  /** ISO 8601 `YYYY-MM-DD`; a trailing time or zone (`2024-08-27Z`) is ignored. */
  static fromIsoString(text: string): CalendarDay {
    const match = C.isoDayPattern.exec(text.trim());
    if (!match) throw new InvalidCalendarDayError(text);
    return CalendarDay.create(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  static firstOfMonth(year: number, month: number): CalendarDay {
    return CalendarDay.create(year, month, 1);
  }

  static lastOfMonth(year: number, month: number): CalendarDay {
    return CalendarDay.create(year, month, daysInMonth(year, month));
  }

  /** Negative when this day comes first, positive when it comes after, zero when equal. */
  compare(other: CalendarDay): number {
    return this.year - other.year || this.month - other.month || this.day - other.day;
  }

  toIsoString(): string {
    return describe(this.year, this.month, this.day);
  }

  /** `YYYY-MM`. */
  toIsoMonthString(): string {
    return [pad(this.year, C.yearDigits), pad(this.month, C.monthDigits)].join(C.isoSeparator);
  }

  toJSON(): string {
    return this.toIsoString();
  }
}
