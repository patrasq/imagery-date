import { WEB } from './web.constants.ts';

interface PointHash {
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom: number;
}

/** `#48.853,2.3499,19` → the point and zoom; null for anything else, so a hand-edited link is ignored, not trusted. */
export function pointHash(hash: string): PointHash | null {
  const texts = hash.replace(WEB.hashPrefix, '').split(WEB.hashSeparator);
  if (texts.length !== WEB.hashParts || texts.some((text) => text.trim() === '')) return null;
  const [latitude, longitude, zoom] = texts.map(Number);
  if (latitude === undefined || longitude === undefined || zoom === undefined) return null;
  return [latitude, longitude, zoom].every(Number.isFinite) ? { latitude, longitude, zoom } : null;
}
