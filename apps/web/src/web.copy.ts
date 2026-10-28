/** Text the page writes. */
export const WEB_COPY = Object.freeze({
  idle: 'Click a point on the map.',
  loading: (latitude: string, longitude: string) => `Asking every provider about ${latitude}, ${longitude}…`,
  loadingHistory: 'Asking every archived Esri release; old releases can take a minute…',
  newest: 'Newest photo shown at this zoom',
  noNewest: 'No provider dates a photo shown at this zoom.',
  where: (latitude: string, longitude: string, zoom: number) => `${latitude}, ${longitude} · zoom ${String(zoom)}`,
  statuses: Object.freeze({
    found: 'found',
    partial: 'partly answered',
    'no-date': 'no dated photo here',
    'outside-coverage': 'outside its coverage',
    skipped: 'not asked',
    failed: 'did not answer',
  }),
  precisions: Object.freeze({ day: 'day', month: 'month', year: 'year only', range: 'between these days' }),
  facts: Object.freeze({
    product: 'Product',
    pixel: 'Pixel',
    zoom: 'Zoom',
    distance: 'Distance',
    published: 'First published',
    credit: 'Credit',
  }),
  metres: (value: number) => `${String(value)} m`,
  zoomRange: (minimum: number, maximum: number) =>
    minimum === maximum ? String(minimum) : `${String(minimum)}–${String(maximum)}`,
  missing: 'element missing from the page: ',
  failed: (message: string) => `The lookup could not run: ${message}`,
} as const);
