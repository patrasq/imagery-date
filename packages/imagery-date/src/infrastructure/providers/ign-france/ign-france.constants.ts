import { BoundingBox } from '../../../domain/geo/bounding-box.value-object.ts';
import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const IGN_FRANCE = Object.freeze({
  /** Géoplateforme WFS: the mosaic graph of BD ORTHO, one polygon per flight with its day (`date_vol`). */
  wfsUrl: 'https://data.geopf.fr/wfs/ows',
  parameters: Object.freeze({
    SERVICE: 'WFS',
    VERSION: '2.0.0',
    REQUEST: 'GetFeature',
    TYPENAMES: 'ORTHOIMAGERY.ORTHOPHOTOS.GRAPHE-MOSAIQUAGE:graphe_bdortho',
    OUTPUTFORMAT: 'application/json',
    COUNT: '10',
    /** Only the fields read here: without it each answer carries the polygons, ~2 MB instead of ~1 KB. */
    PROPERTYNAME: 'date_vol,res,pva',
  }),
  bboxParameter: 'BBOX',
  /** WFS 2.0 axis order for EPSG:4326 is latitude first. */
  bboxCrs: 'urn:ogc:def:crs:EPSG::4326',
  listSeparator: ',',
  /** Half the side of the box queried around the point, in degrees (about half a metre). */
  boxHalfSideDegrees: 0.000_005,
  productName: 'BD ORTHO',
  wordSeparator: ' ',
  centimetresPerMetre: 100,
  descriptor: Object.freeze({
    id: ProviderId.IgnFrance,
    name: 'IGN France BD ORTHO',
    terms: TermsClass.OpenLicence,
    credential: null,
    billable: false,
    enabledByDefault: true,
    /** Metropolitan France with Corsica, then Guadeloupe, Martinique, Guyane, La Réunion and Mayotte. */
    coverage: Object.freeze([
      BoundingBox.of({ south: 41.2, west: -5.3, north: 51.2, east: 9.7 }),
      BoundingBox.of({ south: 15.8, west: -61.9, north: 16.6, east: -61.0 }),
      BoundingBox.of({ south: 14.3, west: -61.3, north: 14.9, east: -60.8 }),
      BoundingBox.of({ south: 2.1, west: -54.7, north: 5.8, east: -51.6 }),
      BoundingBox.of({ south: -21.4, west: 55.2, north: -20.8, east: 55.9 }),
      BoundingBox.of({ south: -13.1, west: 45.0, north: -12.6, east: 45.3 }),
    ]),
    attribution: 'IGN – BD ORTHO®, Licence Ouverte 2.0',
    homepage: 'https://geoservices.ign.fr/bdortho',
  } satisfies ProviderDescriptor),
} as const);
