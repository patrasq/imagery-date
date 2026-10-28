import { describe, expect, it } from 'vitest';
import { CalendarDay } from '../calendar/calendar-day.value-object.ts';
import { ErrorCode } from '../errors/error-code.enum.ts';
import { CaptureDate } from './capture-date.value-object.ts';
import { DatePrecision } from './date-precision.enum.ts';

const day = (text: string): CalendarDay => CalendarDay.fromIsoString(text);

describe(CaptureDate.name, () => {
  it('states a day as that day', () => {
    const date = CaptureDate.day(day('2024-08-27'));
    expect(date.toJSON()).toEqual({
      value: '2024-08-27',
      precision: DatePrecision.Day,
      start: '2024-08-27',
      end: '2024-08-27',
    });
  });

  it('states a month as its first to last day, written as YYYY-MM', () => {
    expect(CaptureDate.month(2024, 2).toJSON()).toEqual({
      value: '2024-02',
      precision: DatePrecision.Month,
      start: '2024-02-01',
      end: '2024-02-29',
    });
  });

  it('states a year as 1 January to 31 December, written as YYYY', () => {
    expect(CaptureDate.year(2025).toJSON()).toEqual({
      value: '2025',
      precision: DatePrecision.Year,
      start: '2025-01-01',
      end: '2025-12-31',
    });
  });

  it('writes a range as an ISO 8601 interval, and a one-day range as that day', () => {
    expect(CaptureDate.range(day('2021-06-16'), day('2021-10-08')).value).toBe('2021-06-16/2021-10-08');
    const single = CaptureDate.range(day('2022-08-04'), day('2022-08-04'));
    expect(single.precision).toBe(DatePrecision.Day);
    expect(single.value).toBe('2022-08-04');
  });
});

describe(`${CaptureDate.name}: ranges and ordering`, () => {
  it('refuses a range that ends before it starts', () => {
    expect(() => CaptureDate.range(day('2021-10-08'), day('2021-06-16'))).toThrow(
      expect.objectContaining({ code: ErrorCode.InvalidDateRange }),
    );
  });

  it('compares by last possible day, then first possible day', () => {
    const year = CaptureDate.year(2025);
    const lateDay = CaptureDate.day(day('2025-12-31'));
    const earlyDay = CaptureDate.day(day('2025-03-21'));
    expect(lateDay.compare(earlyDay)).toBeGreaterThan(0);
    expect(year.compare(earlyDay)).toBeGreaterThan(0);
    expect(lateDay.compare(year)).toBeGreaterThan(0);
    expect(year.compare(CaptureDate.year(2025))).toBe(0);
  });

  it('is equal only at the same precision and the same days', () => {
    expect(CaptureDate.year(2025).equals(CaptureDate.year(2025))).toBe(true);
    expect(CaptureDate.month(2025, 1).equals(CaptureDate.month(2025, 2))).toBe(false);
    expect(CaptureDate.day(day('2025-01-01')).equals(CaptureDate.range(day('2025-01-01'), day('2025-01-01')))).toBe(
      true,
    );
  });
});
