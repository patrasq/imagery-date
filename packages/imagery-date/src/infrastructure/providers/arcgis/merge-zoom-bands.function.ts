import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { ZoomRange } from '../../../domain/geo/zoom-range.value-object.ts';

const samePhoto = (a: Capture, b: Capture): boolean =>
  a.date.equals(b.date) && a.product === b.product && a.resolutionMetres === b.resolutionMetres;

const touching = (lower: ZoomRange | null, upper: ZoomRange | null): boolean =>
  lower !== null && upper !== null && upper.minimum <= lower.maximum + 1;

/**
 * One capture per photo: Esri lists one photo once per zoom band it is cached in (12–18 and 19–19), so bands of the
 * same photo that meet are joined (12–19). Sorted by zoom, lowest first.
 */
export function mergeZoomBands(captures: readonly Capture[]): Capture[] {
  const sorted = [...captures].sort((a, b) => (a.zoomRange?.minimum ?? 0) - (b.zoomRange?.minimum ?? 0));
  return sorted.reduce<Capture[]>((merged, capture) => {
    const index = merged.findIndex((kept) => samePhoto(kept, capture) && touching(kept.zoomRange, capture.zoomRange));
    const kept = merged[index];
    if (kept === undefined || kept.zoomRange === null || capture.zoomRange === null) return [...merged, capture];
    const zoomRange = ZoomRange.between(
      kept.zoomRange.minimum,
      Math.max(kept.zoomRange.maximum, capture.zoomRange.maximum),
    );
    return merged.map((entry, position) => (position === index ? { ...kept, zoomRange } : entry));
  }, []);
}
