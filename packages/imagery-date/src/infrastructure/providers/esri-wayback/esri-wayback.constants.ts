import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const ESRI_WAYBACK = Object.freeze({
  /** Every archived release of World Imagery, keyed by release number. */
  configUrl: 'https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json',
  /** `<release>/<zoom>/<row>/<column>`: whether the release has the tile, and which release it was first drawn in. */
  tilemapUrl: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tilemap',
  pathSeparator: '/',
  /** `World Imagery (Wayback 2026-09-24)` → the release day. */
  titleDay: /\(Wayback (\d{4}-\d{2}-\d{2})\)/,
  /** Metadata layer 0 holds the 1.9 cm footprints shown at zoom 23; each layer up is one zoom less, to layer 13. */
  deepestLayerZoom: 23,
  lastLayer: 13,
  tilePresent: 1,
  /** Archived metadata services answer slowly: 25–61 s, sometimes a 502, measured 2026-10-28 (DECISIONS.md D-009). */
  metadataTimeoutMilliseconds: 90_000,
  fulfilled: 'fulfilled',
  rejected: 'rejected',
  descriptor: Object.freeze({
    id: ProviderId.EsriWayback,
    name: 'Esri World Imagery Wayback',
    terms: TermsClass.PublicTermsUnclear,
    credential: null,
    billable: false,
    enabledByDefault: false,
    coverage: null,
    attribution: 'Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    homepage: 'https://livingatlas.arcgis.com/wayback/',
  } satisfies ProviderDescriptor),
} as const);
