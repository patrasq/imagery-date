import type { ZoomLevel } from './zoom-level.value-object.ts';

/** The zoom levels at which a provider shows one capture, both ends included. */
export class ZoomRange {
  readonly minimum: number;
  readonly maximum: number;

  private constructor(minimum: number, maximum: number) {
    this.minimum = minimum;
    this.maximum = maximum;
  }

  static between(minimum: number, maximum: number): ZoomRange {
    return new ZoomRange(Math.min(minimum, maximum), Math.max(minimum, maximum));
  }

  static only(zoom: ZoomLevel): ZoomRange {
    return new ZoomRange(zoom.value, zoom.value);
  }

  contains(zoom: ZoomLevel): boolean {
    return zoom.value >= this.minimum && zoom.value <= this.maximum;
  }

  toJSON(): { minimum: number; maximum: number } {
    return { minimum: this.minimum, maximum: this.maximum };
  }
}
