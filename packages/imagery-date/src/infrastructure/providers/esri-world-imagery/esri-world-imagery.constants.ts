import { ProviderId } from '../../../domain/provider/provider-id.enum.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { TermsClass } from '../../../domain/provider/terms-class.enum.ts';

export const ESRI_WORLD_IMAGERY = Object.freeze({
  serviceUrl: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
  /** "Citations": every footprint at the point with the zoom range Esri shows it at, in one request. */
  citationsLayer: 4,
  descriptor: Object.freeze({
    id: ProviderId.EsriWorldImagery,
    name: 'Esri World Imagery',
    terms: TermsClass.PublicTermsUnclear,
    credential: null,
    billable: false,
    enabledByDefault: true,
    coverage: null,
    attribution: 'Esri, Vantor, Earthstar Geographics, and the GIS User Community',
    homepage: 'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9',
  } satisfies ProviderDescriptor),
} as const);
