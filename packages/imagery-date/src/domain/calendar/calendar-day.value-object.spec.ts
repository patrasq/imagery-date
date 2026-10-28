import { describe, expect, it } from 'vitest';
import { ErrorCode } from '../errors/error-code.enum.ts';
import { CalendarDay } from './calendar-day.value-object.ts';

describe(CalendarDay.name, () => {
  it('formats as ISO 8601 with zero padding', () => {
    expect(CalendarDay.create(2025, 3, 1).toIsoString()).toBe('2025-03-01');
    expect(CalendarDay.create(2025, 3, 1).toIsoMonthString()).toBe('2025-03');
    expect(JSON.stringify(CalendarDay.create(2012, 1, 15))).toBe('"2012-01-15"');
  });

  it('accepts 29 February only in leap years, including the 400-year rule', () => {
    expect(CalendarDay.create(2024, 2, 29).day).toBe(29);
    expect(CalendarDay.create(2000, 2, 29).day).toBe(29);
    expect(() => CalendarDay.create(2023, 2, 29)).toThrow(
      expect.objectContaining({ code: ErrorCode.InvalidCalendarDay }),
    );
    expect(() => CalendarDay.create(1900, 2, 29)).toThrow(/Not a calendar day: 1900-02-29/);
  });

  it.each([
    [2025, 13, 1],
    [2025, 0, 1],
    [2025, 4, 31],
    [2025, 4, 0],
    [1799, 1, 1],
    [2025.5, 1, 1],
    [2025, 1, 1.5],
  ])('refuses %d-%d-%d', (year, month, day) => {
    expect(() => CalendarDay.create(year, month, day)).toThrow(
      expect.objectContaining({ code: ErrorCode.InvalidCalendarDay }),
    );
  });
});

describe(`${CalendarDay.name}: parsing and ordering`, () => {
  it("reads Esri's compact SRC_DATE number", () => {
    expect(CalendarDay.fromCompactNumber(20250321).toIsoString()).toBe('2025-03-21');
    expect(() => CalendarDay.fromCompactNumber(20251321)).toThrow();
  });

  it('reads ISO days and ignores a trailing zone or time', () => {
    expect(CalendarDay.fromIsoString('2024-08-27Z').toIsoString()).toBe('2024-08-27');
    expect(CalendarDay.fromIsoString(' 2024-08-27T10:00:00Z ').toIsoString()).toBe('2024-08-27');
    expect(() => CalendarDay.fromIsoString('27/08/2024')).toThrow(/Not a calendar day: 27\/08\/2024/);
    expect(() => CalendarDay.fromIsoString('2024-08-27junk')).toThrow();
  });

  it('knows the first and last day of a month', () => {
    expect(CalendarDay.lastOfMonth(2024, 2).toIsoString()).toBe('2024-02-29');
    expect(CalendarDay.lastOfMonth(2025, 2).toIsoString()).toBe('2025-02-28');
    expect(CalendarDay.firstOfMonth(2025, 12).toIsoString()).toBe('2025-12-01');
  });

  it('orders days by year, then month, then day', () => {
    const day = CalendarDay.create(2025, 3, 21);
    expect(day.compare(CalendarDay.create(2025, 3, 21))).toBe(0);
    expect(day.compare(CalendarDay.create(2025, 3, 22))).toBeLessThan(0);
    expect(day.compare(CalendarDay.create(2025, 2, 28))).toBeGreaterThan(0);
    expect(day.compare(CalendarDay.create(2024, 12, 31))).toBeGreaterThan(0);
  });
});
