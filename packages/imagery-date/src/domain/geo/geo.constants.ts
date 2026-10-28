/** WGS 84 bounds and the mean Earth radius (IUGG) used for great-circle distances. */
export const GEO = Object.freeze({
  minimumLatitude: -90,
  maximumLatitude: 90,
  minimumLongitude: -180,
  maximumLongitude: 180,
  meanEarthRadiusMetres: 6_371_008.8,
  degreesPerHalfTurn: 180,
  half: 0.5,
  two: 2,
} as const);
