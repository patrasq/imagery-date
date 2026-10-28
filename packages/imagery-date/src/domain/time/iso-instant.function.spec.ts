import { describe, expect, it } from 'vitest';
import { isoInstant } from './iso-instant.function.ts';

describe(isoInstant.name, () => {
  it.each([
    [0, '1970-01-01T00:00:00.000Z'],
    [951_782_400_000, '2000-02-29T00:00:00.000Z'],
    [1_709_164_800_000, '2024-02-29T00:00:00.000Z'],
    [1_742_515_200_000, '2025-03-21T00:00:00.000Z'],
    [1_793_000_000_123, '2026-10-26T07:33:20.123Z'],
    [4_102_444_799_999, '2099-12-31T23:59:59.999Z'],
    [-1, '1969-12-31T23:59:59.999Z'],
    [-2_208_988_800_000, '1900-01-01T00:00:00.000Z'],
  ])('%d is %s', (epochMilliseconds, iso) => {
    expect(isoInstant(epochMilliseconds)).toBe(iso);
  });
});
