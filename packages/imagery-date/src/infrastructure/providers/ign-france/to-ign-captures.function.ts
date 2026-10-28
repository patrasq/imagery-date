import type * as z from 'zod/mini';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import { CalendarDay } from '../../../domain/calendar/calendar-day.value-object.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { IGN_FRANCE as I } from './ign-france.constants.ts';
import { IGN_FRANCE_COPY } from './ign-france.copy.ts';
import type { ignMosaicFeatureSchema } from './ign-mosaic-feature.schema.ts';

type Feature = z.infer<typeof ignMosaicFeatureSchema>;

const flightDay = (text: string, host: string): CalendarDay => {
  try {
    return CalendarDay.fromIsoString(text);
  } catch {
    throw new ProviderFailureError(FailureCode.InvalidResponse, IGN_FRANCE_COPY.invalidDay(host, text));
  }
};

const toCapture = (feature: Feature, host: string): Capture => {
  const { date_vol: flown, res: centimetres, pva: campaign } = feature.properties;
  const product = (campaign ?? null) === null ? I.productName : [I.productName, campaign].join(I.wordSeparator);
  return {
    provider: I.descriptor.id,
    date: CaptureDate.day(flightDay(flown, host)),
    product,
    resolutionMetres: (centimetres ?? null) === null ? null : Number(centimetres) / I.centimetresPerMetre,
    zoomRange: null,
    distanceMetres: null,
    publishedOn: null,
    attribution: I.descriptor.attribution,
  };
};

/** Mosaic polygons as captures, one per distinct flight (a point on a seam touches two polygons of one flight). */
export function toIgnCaptures(features: readonly Feature[], host: string): Capture[] {
  const flights = new Map<string, Capture>();
  for (const feature of features) {
    const capture = toCapture(feature, host);
    flights.set(JSON.stringify([capture.date.value, capture.product, capture.resolutionMetres]), capture);
  }
  return [...flights.values()].sort((a, b) => b.date.compare(a.date));
}
