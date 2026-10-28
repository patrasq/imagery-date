import type * as z from 'zod/mini';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import { ZoomRange } from '../../../domain/geo/zoom-range.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { ARCGIS } from './arcgis.constants.ts';
import { ARCGIS_COPY } from './arcgis.copy.ts';
import type { EsriCaptureContext } from './esri-capture-context.interface.ts';
import type { esriImageryAttributesSchema } from './esri-imagery-attributes.schema.ts';

type Attributes = z.infer<typeof esriImageryAttributesSchema>;

const day = (compact: number, host: string): CalendarDay => {
  try {
    return CalendarDay.fromCompactNumber(compact);
  } catch {
    throw new ProviderFailureError(FailureCode.InvalidResponse, ARCGIS_COPY.invalidDate(host, compact));
  }
};

const zoomRange = (attributes: Attributes, fallback: ZoomRange | null): ZoomRange | null => {
  const minimum = attributes.MinMapLevel ?? null;
  const maximum = attributes.MaxMapLevel ?? null;
  return minimum !== null && maximum !== null ? ZoomRange.between(minimum, maximum) : fallback;
};

/** An Esri imagery footprint as a capture; null when the footprint is undated (the 15 m world mosaic). */
export function toEsriCapture(attributes: Attributes, context: EsriCaptureContext): Capture | null {
  if (attributes.SRC_DATE === null) return null;
  const resolution = attributes.SRC_RES ?? null;
  return {
    provider: context.provider,
    date: CaptureDate.day(day(attributes.SRC_DATE, context.host)),
    product: attributes.NICE_NAME ?? null,
    resolutionMetres:
      resolution === null ? null : Math.round(resolution * ARCGIS.resolutionScale) / ARCGIS.resolutionScale,
    zoomRange: zoomRange(attributes, context.zoomRange),
    distanceMetres: null,
    publishedOn: context.publishedOn,
    attribution: context.attribution,
  };
}
