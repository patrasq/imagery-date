import type { Capture } from '../capture/capture.interface.ts';
import type { ZoomLevel } from '../geo/zoom-level.value-object.ts';
import type { ProviderOutcome } from './provider-outcome.interface.ts';

const shownAt = (capture: Capture, zoom: ZoomLevel): boolean =>
  capture.zoomRange === null || capture.zoomRange.contains(zoom);

/**
 * The most recently taken photo shown at the zoom: by last possible day, then first possible day. Archive entries
 * (photos with a publication day, which are no longer necessarily shown) do not compete with current imagery.
 */
export function newestCapture(outcomes: readonly ProviderOutcome[], zoom: ZoomLevel): Capture | null {
  const candidates = outcomes
    .flatMap((outcome) => outcome.captures)
    .filter((capture) => capture.publishedOn === null && shownAt(capture, zoom));
  return candidates.reduce<Capture | null>(
    (newest, capture) => (newest === null || capture.date.compare(newest.date) > 0 ? capture : newest),
    null,
  );
}
