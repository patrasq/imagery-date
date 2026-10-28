/** Everything the command line prints. */
export const CLI_COPY = Object.freeze({
  help: `imagery-date — when was the map photo at this point taken?

Usage
  imagery-date <latitude> <longitude> [--zoom 19] [--providers ign-france,bing] [--json]
  imagery-date history <latitude> <longitude> [--zoom 18] [--json]
  imagery-date batch <points.csv | -> [--zoom 19] [--providers …] [--concurrency 8]
  imagery-date providers [--json]

Options
  -z, --zoom          Web Mercator zoom 0–23 (default 19). Providers state which zooms show each photo.
  -p, --providers     Comma-separated provider IDs (see "providers"). Default: every provider enabled by default.
  -c, --concurrency   Points looked up at once by "batch" (default 8).
      --json          Print the report as JSON.
  -h, --help          Show this help.
  -v, --version       Show the version.

batch reads a CSV with a header row naming latitude and longitude columns (lat/lon/lng also work) and optional
id and zoom columns, and writes one CSV row per photo found, in input order.

Set IMAGERY_DATE_GOOGLE_KEY to a Google Maps Platform key to add Google Street View (free); google-solar is billed
by Google and runs only when named in --providers.

A capture date is when the photo was taken, not proof the place still looks like that.
`,
  reportHeading: (latitude: number, longitude: number, zoom: number, observedAt: string) =>
    `${String(latitude)}, ${String(longitude)} · zoom ${String(zoom)} · asked ${observedAt}`,
  newest: (date: string, provider: string) => `Newest photo shown at this zoom: ${date} (${provider})`,
  noNewest: 'No provider dates a photo shown at this zoom.',
  caveat: 'A capture date is when the photo was taken, not proof the place still looks like that.',
  columns: Object.freeze(['Provider', 'Status', 'Taken', 'Product', 'Pixel', 'Zoom', 'Distance', 'Published', 'Note']),
  providerColumns: Object.freeze(['ID', 'Name', 'Terms', 'Key', 'Default', 'Billable']),
  yes: 'yes',
  no: 'no',
  metres: (value: number) => `${String(value)} m`,
  zoomRange: (minimum: number, maximum: number) =>
    minimum === maximum ? String(minimum) : `${String(minimum)}–${String(maximum)}`,
  outsideCoverage: 'outside its coverage',
  noDate: 'no dated photo here',
  needsLatitudeLongitude: 'Give a latitude and a longitude: imagery-date 48.853 2.3499',
  notANumber: (name: string, text: string) => `${name} must be a number; got "${text}".`,
  concurrencyRange: 'Concurrency must be a whole number of at least 1.',
  missingColumns: (header: readonly string[]) =>
    `The CSV header needs latitude and longitude columns (lat, lon and lng also work); it has: ${header.join(', ')}`,
  refused: 'refused',
  error: (message: string) => `imagery-date: ${message}\n`,
  latitude: 'Latitude',
  longitude: 'Longitude',
  zoom: 'Zoom',
} as const);
