import { InvalidCoordinatesError } from '../errors/invalid-coordinates.error.ts';
import { GEO } from './geo.constants.ts';

const within = (value: number, minimum: number, maximum: number): boolean =>
  Number.isFinite(value) && value >= minimum && value <= maximum;

/** A WGS 84 position. Latitude and longitude in decimal degrees. */
export class GeoPoint {
  readonly latitude: number;
  readonly longitude: number;

  private constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  /** @throws InvalidCoordinatesError when either coordinate is not a finite number within WGS 84 bounds. */
  static create(latitude: number, longitude: number): GeoPoint {
    const valid =
      within(latitude, GEO.minimumLatitude, GEO.maximumLatitude) &&
      within(longitude, GEO.minimumLongitude, GEO.maximumLongitude);
    if (!valid) throw new InvalidCoordinatesError(latitude, longitude);
    return new GeoPoint(latitude, longitude);
  }

  toJSON(): { latitude: number; longitude: number } {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}
