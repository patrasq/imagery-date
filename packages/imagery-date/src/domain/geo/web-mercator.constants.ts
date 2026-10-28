/** The spherical Web Mercator tile grid every slippy map uses (EPSG:3857, 256-pixel tiles, quadkeys). */
export const WEB_MERCATOR = Object.freeze({
  /** Latitude where the square projection ends: atan(sinh(π)) in degrees. */
  maximumLatitude: 85.051_128_779_806_59,
  minimumZoom: 0,
  /** Esri's deepest cache level (1.9 cm); no provider here serves a deeper one. */
  maximumZoom: 23,
  tileGridBase: 2,
  degreesPerTurn: 360,
  degreesPerHalfTurn: 180,
  half: 0.5,
  /** A quadkey digit adds 1 for the column bit and 2 for the row bit. */
  quadkeyColumnBit: 1,
  quadkeyRowBit: 2,
} as const);
