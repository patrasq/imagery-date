import type { HttpClient } from '../../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../../application/ports/http-method.enum.ts';
import { ImageryDateProvider } from '../../../application/ports/imagery-date-provider.port.ts';
import type { ProviderQuery } from '../../../application/ports/provider-query.interface.ts';
import type { Capture } from '../../../domain/capture/capture.interface.ts';
import { TileCoordinate } from '../../../domain/geo/tile-coordinate.value-object.ts';
import { ZoomRange } from '../../../domain/geo/zoom-range.value-object.ts';
import type { ProviderDescriptor } from '../../../domain/provider/provider-descriptor.interface.ts';
import { readJson } from '../../http/read-json.function.ts';
import { ARCGIS } from '../arcgis/arcgis.constants.ts';
import { arcgisPointQueryUrl } from '../arcgis/arcgis-point-query-url.function.ts';
import { toEsriCapture } from '../arcgis/to-esri-capture.function.ts';
import { readEsriImagery } from '../arcgis/read-esri-imagery.function.ts';
import { ESRI_WAYBACK as W } from './esri-wayback.constants.ts';
import { waybackChanges } from './wayback-changes.function.ts';
import { waybackConfigSchema } from './wayback-config.schema.ts';
import type { WaybackRelease } from './wayback-release.interface.ts';
import { waybackReleases } from './wayback-releases.function.ts';
import { waybackTilemapSchema } from './wayback-tilemap.schema.ts';
import { settledCaptures } from './settled-captures.function.ts';

/**
 * Every photo Esri World Imagery has shown at the point since February 2014, each with the day it was taken and the
 * first archived release that showed it. About two requests per change of photo, plus the release list once. Old
 * releases answer slowly; a release that does not answer leaves a partial answer, never a lost one.
 */
export class EsriWaybackProvider extends ImageryDateProvider {
  override readonly descriptor: ProviderDescriptor = W.descriptor;
  readonly #http: HttpClient;

  constructor(http: HttpClient) {
    super();
    this.#http = http;
  }

  override async lookup(query: ProviderQuery): Promise<readonly Capture[]> {
    const releases = await this.#releases(query.signal);
    const tile = TileCoordinate.containing(query.point, query.zoom);
    const changes = await waybackChanges(releases, (release) => this.#drawnIn(release, tile, query.signal));
    return settledCaptures(await Promise.allSettled(changes.map((release) => this.#captures(release, query))));
  }

  async #releases(signal: AbortSignal | null): Promise<WaybackRelease[]> {
    const url = new URL(W.configUrl);
    const response = await this.#http.send({ method: HttpMethod.Get, url, signal });
    return waybackReleases(readJson(response, url.host, waybackConfigSchema));
  }

  async #drawnIn(release: WaybackRelease, tile: TileCoordinate, signal: AbortSignal | null): Promise<number | null> {
    const path = [W.tilemapUrl, release.number, tile.zoom, tile.row, tile.column].join(W.pathSeparator);
    const url = new URL(path);
    const tilemap = readJson(
      await this.#http.send({ method: HttpMethod.Get, url, signal }),
      url.host,
      waybackTilemapSchema,
    );
    if (tilemap.data[0] !== W.tilePresent) return null;
    return tilemap.select?.[0] ?? release.number;
  }

  async #captures(release: WaybackRelease, query: ProviderQuery): Promise<Capture[]> {
    const layer = Math.min(W.lastLayer, Math.max(0, W.deepestLayerZoom - query.zoom.value));
    const url = arcgisPointQueryUrl(release.metadataLayerUrl, layer, query.point, ARCGIS.archiveFields);
    const timeoutMilliseconds = W.metadataTimeoutMilliseconds;
    const footprints = await readEsriImagery(this.#http, { url, signal: query.signal, timeoutMilliseconds });
    const context = {
      provider: W.descriptor.id,
      host: url.host,
      attribution: W.descriptor.attribution,
      publishedOn: release.publishedOn,
      zoomRange: ZoomRange.only(query.zoom),
    };
    return footprints.flatMap((attributes) => toEsriCapture(attributes, context) ?? []);
  }
}
