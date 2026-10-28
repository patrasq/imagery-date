/**
 * Every provider this library dates imagery for, in report order: national open surveys, global basemaps, the
 * basemap archive, then Google. The values are stable public identifiers (CLI, JSON, CSV).
 */
export const ProviderId = Object.freeze({
  IgnFrance: 'ign-france',
  Swisstopo: 'swisstopo',
  EsriWorldImagery: 'esri-world-imagery',
  Bing: 'bing',
  EsriWayback: 'esri-wayback',
  GoogleStreetView: 'google-street-view',
  GoogleSolar: 'google-solar',
} as const);
