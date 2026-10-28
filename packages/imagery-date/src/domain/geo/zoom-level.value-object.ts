import { InvalidZoomError } from '../errors/invalid-zoom.error.ts';
import { WEB_MERCATOR } from './web-mercator.constants.ts';

/** A Web Mercator zoom level: 0 shows the world in one tile, each level halves the ground size of a pixel. */
export class ZoomLevel {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  /** @throws InvalidZoomError when the zoom is not a whole number from 0 to 23. */
  static create(value: number): ZoomLevel {
    const valid = Number.isInteger(value) && value >= WEB_MERCATOR.minimumZoom && value <= WEB_MERCATOR.maximumZoom;
    if (!valid) throw new InvalidZoomError(value, WEB_MERCATOR.maximumZoom);
    return new ZoomLevel(value);
  }

  /** The nearest whole zoom of a fractional map zoom, kept inside the grid. */
  static nearest(value: number): ZoomLevel {
    const rounded = Math.round(Number.isFinite(value) ? value : WEB_MERCATOR.minimumZoom);
    return new ZoomLevel(Math.min(WEB_MERCATOR.maximumZoom, Math.max(WEB_MERCATOR.minimumZoom, rounded)));
  }

  /** This zoom, or the provider's deepest level when this one is deeper. */
  atMost(maximum: number): ZoomLevel {
    return this.value <= maximum ? this : ZoomLevel.create(maximum);
  }

  toJSON(): number {
    return this.value;
  }
}
