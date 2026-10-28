import type { Capture } from '../../../domain/capture/capture.interface.ts';

const photoKey = (capture: Capture): string =>
  JSON.stringify([capture.date.value, capture.product, capture.resolutionMetres]);

/**
 * One entry per photo, with the first release that published it: a tile is redrawn in later releases without a new
 * photo. Newest photo first.
 */
export function earliestPublications(captures: readonly Capture[]): Capture[] {
  const earliest = new Map<string, Capture>();
  for (const capture of captures) {
    const key = photoKey(capture);
    const kept = earliest.get(key);
    const keptOn = kept?.publishedOn ?? null;
    const earlier = keptOn !== null && capture.publishedOn !== null && capture.publishedOn.compare(keptOn) < 0;
    if (kept === undefined || earlier) earliest.set(key, capture);
  }
  return [...earliest.values()].sort((a, b) => b.date.compare(a.date));
}
