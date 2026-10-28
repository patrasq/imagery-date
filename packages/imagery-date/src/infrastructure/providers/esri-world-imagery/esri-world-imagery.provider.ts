import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { ARCGIS } from '../arcgis/arcgis.constants.ts';
import { arcgisPointQueryUrl } from '../arcgis/arcgis-point-query-url.function.ts';
import { toEsriCapture } from '../arcgis/to-esri-capture.function.ts';
import { mergeZoomBands } from '../arcgis/merge-zoom-bands.function.ts';
import { readEsriImagery } from '../arcgis/read-esri-imagery.function.ts';
import { ESRI_WORLD_IMAGERY as E } from './esri-world-imagery.constants.ts';

/**
 * The photos Esri's World Imagery basemap shows at the point today, one per zoom band, each with the day it was taken
 * (`SRC_DATE`), from the basemap's own metadata layer. One request per point.
 */
export class EsriWorldImageryProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = E.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const url = arcgisPointQueryUrl(E.serviceUrl, E.citationsLayer, query.point, ARCGIS.currentFields);
    const footprints = await readEsriImagery(this.#http, { url, signal: query.signal });
    const context = {
      provider: E.descriptor.id,
      host: url.host,
      attribution: E.descriptor.attribution,
      publishedOn: null,
      zoomRange: null,
    };
    const captures = footprints.flatMap((attributes) => toEsriCapture(attributes, context) ?? []);
    return mergeZoomBands(captures);
  }
}
