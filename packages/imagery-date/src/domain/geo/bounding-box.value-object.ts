import type { GeoPoint } from './geo-point.value-object.ts';

/** A latitude/longitude rectangle (no antimeridian crossing), used for coarse coverage checks. */
export class BoundingBox {
  readonly south: number;
  readonly west: number;
  readonly north: number;
  readonly east: number;

  private constructor(south: number, west: number, north: number, east: number) {
    this.south = south;
    this.west = west;
    this.north = north;
    this.east = east;
  }

  static of(corners: { south: number; west: number; north: number; east: number }): BoundingBox {
    return new BoundingBox(corners.south, corners.west, corners.north, corners.east);
  }

  contains(point: GeoPoint): boolean {
    return (
      point.latitude >= this.south &&
      point.latitude <= this.north &&
      point.longitude >= this.west &&
      point.longitude <= this.east
    );
  }
}
