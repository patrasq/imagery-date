import type { ProviderRegistry } from '../application/lookup/provider-registry.type.ts';
import type { HttpClient } from '../application/ports/http-client.port.ts';
import type { ImageryDateProvider } from '../application/ports/imagery-date-provider.port.ts';
import { BingProvider } from '../infrastructure/providers/bing/bing.provider.ts';
import { EsriWaybackProvider } from '../infrastructure/providers/esri-wayback/esri-wayback.provider.ts';
import { EsriWorldImageryProvider } from '../infrastructure/providers/esri-world-imagery/esri-world-imagery.provider.ts';
import { GoogleSolarProvider } from '../infrastructure/providers/google-solar/google-solar.provider.ts';
import { GoogleStreetViewProvider } from '../infrastructure/providers/google-street-view/google-street-view.provider.ts';
import { IgnFranceProvider } from '../infrastructure/providers/ign-france/ign-france.provider.ts';
import { SwisstopoProvider } from '../infrastructure/providers/swisstopo/swisstopo.provider.ts';

/** Every provider, in the order reports list them: national open surveys first, then global basemaps, then Google. */
export function defaultProviderRegistry(http: HttpClient): ProviderRegistry {
  const providers: ImageryDateProvider[] = [
    new IgnFranceProvider(http),
    new SwisstopoProvider(http),
    new EsriWorldImageryProvider(http),
    new BingProvider(http),
    new EsriWaybackProvider(http),
    new GoogleStreetViewProvider(http),
    new GoogleSolarProvider(http),
  ];
  return new Map(providers.map((provider) => [provider.descriptor.id, provider]));
}
