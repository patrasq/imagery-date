import { BoundingBox } from '../../../domain/geo/bounding-box.value-object.ts';
import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const SWISSTOPO = Object.freeze({
  /** geo.admin.ch identify on the SWISSIMAGE 10 cm metadata layer: per map sheet, the year of the flight. */
  identifyUrl: 'https://api3.geo.admin.ch/rest/services/all/MapServer/identify',
  parameters: Object.freeze({
    geometryType: 'esriGeometryPoint',
    sr: '4326',
    layers: 'all:ch.swisstopo.images-swissimage-dop10.metadata',
    tolerance: '0',
    returnGeometry: 'false',
    imageDisplay: '100,100,96',
  }),
  geometryParameter: 'geometry',
  mapExtentParameter: 'mapExtent',
  /** The identify service needs a map extent; a small one around the point. */
  extentHalfSideDegrees: 0.01,
  listSeparator: ',',
  /** `10 cm` → 0.1 m. */
  centimetres: /^(\d+(?:\.\d+)?)\s*cm$/,
  centimetresPerMetre: 100,
  productName: 'SWISSIMAGE 10 cm',
  descriptor: Object.freeze({
    id: ProviderId.Swisstopo,
    name: 'swisstopo SWISSIMAGE',
    terms: TermsClass.OpenLicence,
    credential: null,
    billable: false,
    enabledByDefault: true,
    /** Switzerland and Liechtenstein. */
    coverage: Object.freeze([BoundingBox.of({ south: 45.8, west: 5.9, north: 47.9, east: 10.6 })]),
    attribution: '© swisstopo',
    homepage: 'https://www.swisstopo.admin.ch/en/orthoimage-swissimage-10',
  } satisfies ProviderDescriptor),
} as const);
