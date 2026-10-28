import type * as z from 'zod/mini';
import { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import { distanceInMetres } from '../../../domain/geo/distance-in-metres.function.ts';
import { GeoPoint } from '../../../domain/geo/geo-point.value-object.ts';
import { GOOGLE_SOLAR as G } from './google-solar.constants.ts';
import type { buildingInsightsResponseSchema } from './building-insights-response.schema.ts';
import type { solarDateSchema } from './solar-date.schema.ts';

type Insights = z.infer<typeof buildingInsightsResponseSchema>;
type SolarDate = z.infer<typeof solarDateSchema>;

/** Google's Date: a year, a year and month, or a full day, depending on which parts it leaves at 0. */
const imageryDate = ({ year, month = G.unknownPart, day = G.unknownPart }: SolarDate): CaptureDate => {
  if (month === G.unknownPart) return CaptureDate.year(year);
  if (day === G.unknownPart) return CaptureDate.month(year, month);
  return CaptureDate.day(CalendarDay.create(year, month, day));
};

/** The imagery date of the building Google matched, with how far its centre is from the point. */
export function toSolarCapture(insights: Insights, point: GeoPoint): Capture {
  const quality = insights.imageryQuality;
  const centre = insights.center;
  return {
    provider: G.descriptor.id,
    date: imageryDate(insights.imageryDate),
    product: quality === undefined ? G.productName : G.productName + G.qualityOpen + quality + G.qualityClose,
    resolutionMetres: null,
    zoomRange: null,
    distanceMetres:
      centre === undefined
        ? null
        : Math.round(distanceInMetres(point, GeoPoint.create(centre.latitude, centre.longitude))),
    publishedOn: null,
    attribution: G.descriptor.attribution,
  };
}
