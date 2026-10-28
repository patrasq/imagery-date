/** The ArcGIS REST point query both Esri adapters send (`<layer>/query?geometry=lon,lat&…&f=json`). */
export const ARCGIS = Object.freeze({
  queryPath: 'query',
  pathSeparator: '/',
  listSeparator: ',',
  parameters: Object.freeze({
    geometry: 'geometry',
    geometryType: 'geometryType',
    spatialReference: 'inSR',
    outFields: 'outFields',
    returnGeometry: 'returnGeometry',
    format: 'f',
  }),
  values: Object.freeze({
    point: 'esriGeometryPoint',
    wgs84: '4326',
    no: 'false',
    json: 'json',
  }),
  /** The imagery metadata fields. SRC_DATE is the capture day as a number: 20250321. */
  archiveFields: Object.freeze(['SRC_DATE', 'SRC_RES', 'NICE_NAME']),
  /** The current basemap's citations also say which zoom levels show each footprint. */
  currentFields: Object.freeze(['SRC_DATE', 'SRC_RES', 'NICE_NAME', 'MinMapLevel', 'MaxMapLevel']),
  /** SRC_RES carries single-precision noise (0.10000000149); resolutions are kept to the millimetre. */
  resolutionScale: 1000,
} as const);
