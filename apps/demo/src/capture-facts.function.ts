import type { Capture } from 'imagery-date';
import { WEB_COPY } from './web.copy.ts';

/** What the provider states about a photo besides its date, as label and value; unknown facts are left out. */
export function captureFacts(capture: Capture): [string, string][] {
  const facts: [string, string | null][] = [
    [WEB_COPY.facts.product, capture.product],
    [WEB_COPY.facts.pixel, capture.resolutionMetres === null ? null : WEB_COPY.metres(capture.resolutionMetres)],
    [
      WEB_COPY.facts.zoom,
      capture.zoomRange === null ? null : WEB_COPY.zoomRange(capture.zoomRange.minimum, capture.zoomRange.maximum),
    ],
    [WEB_COPY.facts.distance, capture.distanceMetres === null ? null : WEB_COPY.metres(capture.distanceMetres)],
    [WEB_COPY.facts.published, capture.publishedOn?.toIsoString() ?? null],
    [WEB_COPY.facts.credit, capture.attribution],
  ];
  return facts.flatMap(([label, value]) => (value === null ? [] : [[label, value]]));
}
