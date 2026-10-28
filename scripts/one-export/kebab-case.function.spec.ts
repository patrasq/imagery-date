import { describe, expect, it } from 'vitest';
import { kebabCase } from './kebab-case.function.ts';

describe(kebabCase.name, () => {
  it.each([
    ['HoldRoomHandler', 'hold-room-handler'],
    ['Booking', 'booking'],
    ['BOOKING_RULES', 'booking-rules'],
    ['bookingsTable', 'bookings-table'],
    ['assertTransition', 'assert-transition'],
    ['HTTPServer', 'http-server'],
    ['OtpChallenge2', 'otp-challenge2'],
  ])('%s → %s', (name, expected) => {
    expect(kebabCase(name)).toBe(expected);
  });
});
