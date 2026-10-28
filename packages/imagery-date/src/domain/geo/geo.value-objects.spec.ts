import { describe, expect, it } from 'vitest';
import { ErrorCode } from '../errors/error-code.enum.ts';
import { BoundingBox } from './bounding-box.value-object.ts';
import { distanceInMetres } from './distance-in-metres.function.ts';
import { GeoPoint } from './geo-point.value-object.ts';
import { TileCoordinate } from './tile-coordinate.value-object.ts';
import { ZoomLevel } from './zoom-level.value-object.ts';
import { ZoomRange } from './zoom-range.value-object.ts';

describe(GeoPoint.name, () => {
  it('keeps valid WGS 84 coordinates', () => {
    expect(GeoPoint.create(48.853, 2.3499).toJSON()).toEqual({ latitude: 48.853, longitude: 2.3499 });
    expect(GeoPoint.create(-90, 180).latitude).toBe(-90);
  });

  it.each([
    [91, 0],
    [0, -180.0001],
    [Number.NaN, 0],
    [0, Number.POSITIVE_INFINITY],
  ])('refuses %d, %d', (latitude, longitude) => {
    expect(() => GeoPoint.create(latitude, longitude)).toThrow(
      expect.objectContaining({ code: ErrorCode.InvalidCoordinates }),
    );
  });
});

describe(ZoomLevel.name, () => {
  it('accepts whole zooms 0..23 and refuses the rest', () => {
    expect(ZoomLevel.create(19).value).toBe(19);
    expect(() => ZoomLevel.create(24)).toThrow(expect.objectContaining({ code: ErrorCode.InvalidZoom }));
    expect(() => ZoomLevel.create(18.5)).toThrow(/whole number from 0 to 23; got 18.5/);
  });

  it('rounds a map zoom into the grid and caps a zoom at a provider maximum', () => {
    expect(ZoomLevel.nearest(17.6).value).toBe(18);
    expect(ZoomLevel.nearest(30).value).toBe(23);
    expect(ZoomLevel.nearest(Number.NaN).value).toBe(0);
    expect(ZoomLevel.create(21).atMost(19).value).toBe(19);
    expect(ZoomLevel.create(17).atMost(19).value).toBe(17);
  });
});

describe(TileCoordinate.name, () => {
  it("matches Bing's documented example: tile 3,5 at level 3 is quadkey 213", () => {
    const point = GeoPoint.create(-50, -11.24);
    const tile = TileCoordinate.containing(point, ZoomLevel.create(3));
    expect([tile.column, tile.row]).toEqual([3, 5]);
    expect(tile.quadkey()).toBe('213');
  });

  it('finds the tile of a point and stays on the grid at the poles and the antimeridian', () => {
    const copenhagen = TileCoordinate.containing(GeoPoint.create(55.6761, 12.5683), ZoomLevel.create(18));
    expect([copenhagen.column, copenhagen.row]).toEqual([140223, 82049]);
    const corner = TileCoordinate.containing(GeoPoint.create(-90, 180), ZoomLevel.create(2));
    expect([corner.column, corner.row]).toEqual([3, 3]);
    expect(TileCoordinate.containing(GeoPoint.create(90, -180), ZoomLevel.create(0)).quadkey()).toBe('');
  });
});

describe(distanceInMetres.name, () => {
  it('measures great-circle distances', () => {
    const paris = GeoPoint.create(48.8566, 2.3522);
    const london = GeoPoint.create(51.5074, -0.1278);
    expect(distanceInMetres(paris, london)).toBeGreaterThan(343_000);
    expect(distanceInMetres(paris, london)).toBeLessThan(344_500);
    expect(distanceInMetres(paris, paris)).toBe(0);
  });
});

describe(`${BoundingBox.name} and ${ZoomRange.name}`, () => {
  it('contain their edges', () => {
    const box = BoundingBox.of({ south: 45.8, west: 5.9, north: 47.9, east: 10.5 });
    expect(box.contains(GeoPoint.create(47.3779, 8.5403))).toBe(true);
    expect(box.contains(GeoPoint.create(45.8, 5.9))).toBe(true);
    expect(box.contains(GeoPoint.create(48.853, 2.3499))).toBe(false);
    const range = ZoomRange.between(18, 12);
    expect(range.toJSON()).toEqual({ minimum: 12, maximum: 18 });
    expect(range.contains(ZoomLevel.create(12))).toBe(true);
    expect(range.contains(ZoomLevel.create(19))).toBe(false);
    expect(ZoomRange.only(ZoomLevel.create(19)).toJSON()).toEqual({ minimum: 19, maximum: 19 });
  });
});
