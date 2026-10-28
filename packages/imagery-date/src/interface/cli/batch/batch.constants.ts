/** The batch CSV: header names it accepts on input, and the columns it writes. */
export const BATCH = Object.freeze({
  inputColumns: Object.freeze({
    latitude: Object.freeze(['latitude', 'lat', 'y']),
    longitude: Object.freeze(['longitude', 'lon', 'lng', 'long', 'x']),
    key: Object.freeze(['id', 'key', 'name']),
    zoom: Object.freeze(['zoom', 'z']),
  }),
  /** One row per photo; a provider without photos gets one row with its status. */
  outputColumns: Object.freeze([
    'key',
    'latitude',
    'longitude',
    'zoom',
    'provider',
    'status',
    'date',
    'precision',
    'start',
    'end',
    'product',
    'resolution_m',
    'zoom_min',
    'zoom_max',
    'distance_m',
    'published_on',
    'newest',
    'failure_code',
    'failure_detail',
  ]),
  /** Columns from `date` to `newest`, left blank on a row without a photo. */
  captureColumnCount: 11,
  /** The first data row is row 1; it is the key when the CSV has no id column. */
  firstRow: 1,
} as const);
