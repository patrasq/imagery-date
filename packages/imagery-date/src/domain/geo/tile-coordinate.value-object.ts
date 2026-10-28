import type { GeoPoint } from './geo-point.value-object.ts';
import { WEB_MERCATOR as M } from './web-mercator.constants.ts';
import type { ZoomLevel } from './zoom-level.value-object.ts';

const clampLatitude = (latitude: number): number => Math.max(-M.maximumLatitude, Math.min(M.maximumLatitude, latitude));

/** The Web Mercator tile that contains a point at a zoom level. */
export class TileCoordinate {
  readonly column: number;
  readonly row: number;
  readonly zoom: number;

  private constructor(column: number, row: number, zoom: number) {
    this.column = column;
    this.row = row;
    this.zoom = zoom;
  }

  static containing(point: GeoPoint, zoom: ZoomLevel): TileCoordinate {
    const tiles = M.tileGridBase ** zoom.value;
    const latitude = (clampLatitude(point.latitude) * Math.PI) / M.degreesPerHalfTurn;
    const x = ((point.longitude + M.degreesPerHalfTurn) / M.degreesPerTurn) * tiles;
    const y = (M.half - Math.log(Math.tan(latitude) + 1 / Math.cos(latitude)) / (M.tileGridBase * Math.PI)) * tiles;
    const last = tiles - 1;
    return new TileCoordinate(
      Math.min(last, Math.max(0, Math.floor(x))),
      Math.min(last, Math.max(0, Math.floor(y))),
      zoom.value,
    );
  }

  /** Bing's quadtree key: one base-4 digit per zoom level, most significant first. */
  quadkey(): string {
    const digits: number[] = [];
    for (let level = this.zoom; level > 0; level -= 1) {
      const mask = 1 << (level - 1);
      const columnBit = (this.column & mask) === 0 ? 0 : M.quadkeyColumnBit;
      const rowBit = (this.row & mask) === 0 ? 0 : M.quadkeyRowBit;
      digits.push(columnBit + rowBit);
    }
    return digits.join('');
  }
}
