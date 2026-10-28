import type * as z from 'zod/mini';
import { ProviderFailureError } from '../../../application/errors/provider-failure.error.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../../domain/capture/capture-date.value-object.ts';
import { distanceInMetres } from '../../../domain/geo/distance-in-metres.function.ts';
import { GeoPoint } from '../../../domain/geo/geo-point.value-object.ts';
import { FailureCode } from '../../../domain/outcome/failure-code.enum.ts';
import { GOOGLE_STREET_VIEW as G } from './google-street-view.constants.ts';
import { GOOGLE_STREET_VIEW_COPY } from './google-street-view.copy.ts';
import type { streetViewMetadataResponseSchema } from './street-view-metadata-response.schema.ts';

type Metadata = z.infer<typeof streetViewMetadataResponseSchema>;

const panoramaDate = (text: string): CaptureDate => {
  const match = G.date.exec(text.trim());
  try {
    if (match === null) throw new Error(text);
    return match[2] === undefined
      ? CaptureDate.year(Number(match[1]))
      : CaptureDate.month(Number(match[1]), Number(match[2]));
  } catch {
    throw new ProviderFailureError(FailureCode.InvalidResponse, GOOGLE_STREET_VIEW_COPY.unreadableDate(text));
  }
};

const googleOwned = (copyright: string | undefined): boolean =>
  copyright === undefined || G.googleCopyright.test(copyright.trim());

/** The nearest panorama as a capture, with its distance from the point; null when it has no date. */
export function toStreetViewCapture(metadata: Metadata, point: GeoPoint): Capture | null {
  if (metadata.date === undefined) return null;
  const location = metadata.location;
  return {
    provider: G.descriptor.id,
    date: panoramaDate(metadata.date),
    product: googleOwned(metadata.copyright) ? G.productName : G.contributedProductName,
    resolutionMetres: null,
    zoomRange: null,
    distanceMetres:
      location === undefined ? null : Math.round(distanceInMetres(point, GeoPoint.create(location.lat, location.lng))),
    publishedOn: null,
    attribution: metadata.copyright ?? G.fallbackAttribution,
  };
}
