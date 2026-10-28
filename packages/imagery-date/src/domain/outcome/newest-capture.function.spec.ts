import { describe, expect, it } from 'vitest';
import { CalendarDay } from '../calendar/calendar-day.value-object.ts';
import type { Capture } from '../capture/capture.interface.ts';
import { CaptureDate } from '../capture/capture-date.value-object.ts';
import { ZoomLevel } from '../geo/zoom-level.value-object.ts';
import { ZoomRange } from '../geo/zoom-range.value-object.ts';
import { ProviderId } from '../provider/provider-id.enum.ts';
import { newestCapture } from './newest-capture.function.ts';
import { OutcomeStatus } from './outcome-status.enum.ts';
import type { ProviderOutcome } from './provider-outcome.interface.ts';

const capture = (date: CaptureDate, overrides: Partial<Capture> = {}): Capture => ({
  provider: ProviderId.EsriWorldImagery,
  date,
  product: null,
  resolutionMetres: null,
  zoomRange: null,
  distanceMetres: null,
  publishedOn: null,
  attribution: null,
  ...overrides,
});
const found = (...captures: Capture[]): ProviderOutcome => ({
  provider: ProviderId.EsriWorldImagery,
  status: OutcomeStatus.Found,
  captures,
  failure: null,
});
const day = (text: string): CaptureDate => CaptureDate.day(CalendarDay.fromIsoString(text));

describe(newestCapture.name, () => {
  it('picks the latest photo across providers', () => {
    const latest = capture(day('2025-03-21'));
    const outcomes = [found(capture(day('2024-08-27'))), found(latest, capture(CaptureDate.year(2023)))];
    expect(newestCapture(outcomes, ZoomLevel.create(19))).toBe(latest);
  });

  it('considers only photos shown at the zoom asked about', () => {
    const closeUp = capture(day('2012-01-15'), { zoomRange: ZoomRange.between(20, 20) });
    const satellite = capture(day('2025-03-21'), { zoomRange: ZoomRange.between(12, 18) });
    expect(newestCapture([found(closeUp, satellite)], ZoomLevel.create(20))).toBe(closeUp);
    expect(newestCapture([found(closeUp, satellite)], ZoomLevel.create(17))).toBe(satellite);
  });

  it('leaves archive entries out and returns null when nothing is dated', () => {
    const archived = capture(day('2026-01-01'), { publishedOn: CalendarDay.create(2026, 2, 1) });
    expect(newestCapture([found(archived)], ZoomLevel.create(19))).toBeNull();
    expect(newestCapture([], ZoomLevel.create(19))).toBeNull();
  });
});
