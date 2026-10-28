import type { BatchResult } from '../application/batch/batch-result.interface.ts';
import { mapOrdered } from '../application/batch/map-ordered.function.ts';
import { LookupImageryDates } from '../application/lookup/lookup-imagery-dates.service.ts';
import type { LookupRequest } from '../application/lookup/lookup-request.interface.ts';
import type { ProviderRegistry } from '../application/lookup/provider-registry.type.ts';
import type { Clock } from '../application/ports/clock.port.ts';
import { ImageryDateError } from '../domain/errors/imagery-date.error.ts';
import { GeoPoint } from '../domain/geo/geo-point.value-object.ts';
import { ZoomLevel } from '../domain/geo/zoom-level.value-object.ts';
import type { ImageryDateReport } from '../domain/outcome/imagery-date-report.interface.ts';
import type { Credentials } from '../domain/provider/credentials.type.ts';
import type { ProviderDescriptor } from '../domain/provider/provider-descriptor.interface.ts';
import { ProviderId } from '../domain/provider/provider-id.enum.ts';
import type { BatchOptions } from './batch-options.interface.ts';
import { CLIENT } from './client.constants.ts';
import type { HistoryOptions } from './history-options.interface.ts';
import type { ImageryDateClient } from './imagery-date-client.interface.ts';
import type { LookupOptions } from './lookup-options.interface.ts';
import type { PointInput } from './point-input.interface.ts';
import { providerIds } from './provider-ids.function.ts';

/** The client `createImageryDateClient` returns: validates input at the edge, then hands it to the lookup service. */
export class DefaultImageryDateClient implements ImageryDateClient {
  readonly providers: readonly ProviderDescriptor[];
  readonly #service: LookupImageryDates;
  readonly #credentials: Credentials;

  constructor(registry: ProviderRegistry, clock: Clock, credentials: Credentials) {
    this.providers = [...registry.values()].map((provider) => provider.descriptor);
    this.#service = new LookupImageryDates(registry, clock);
    this.#credentials = credentials;
  }

  /** Async so that refused input rejects, as the interface promises, instead of throwing synchronously. */
  async lookup(latitude: number, longitude: number, options: LookupOptions = {}): Promise<ImageryDateReport> {
    const request = this.#request(latitude, longitude, options);
    return await this.#service.lookup(request);
  }

  history(latitude: number, longitude: number, options: HistoryOptions = {}): Promise<ImageryDateReport> {
    return this.lookup(latitude, longitude, { ...options, providers: [ProviderId.EsriWayback] });
  }

  lookupMany(
    points: AsyncIterable<PointInput> | Iterable<PointInput>,
    options: BatchOptions = {},
  ): AsyncGenerator<BatchResult> {
    return mapOrdered(points, options.concurrency ?? CLIENT.defaultConcurrency, (point) => this.#one(point, options));
  }

  /** A refused point becomes its own result, so one bad row never ends a batch of millions. */
  async #one(point: PointInput, options: BatchOptions): Promise<BatchResult> {
    const zoom = point.zoom ?? options.zoom;
    try {
      const report = await this.lookup(
        point.latitude,
        point.longitude,
        zoom === undefined ? options : { ...options, zoom },
      );
      return { key: point.key, report, error: null };
    } catch (error: unknown) {
      if (error instanceof ImageryDateError) return { key: point.key, report: null, error };
      throw error;
    }
  }

  /** @throws ImageryDateError for coordinates, a zoom or a provider name it refuses. */
  #request(latitude: number, longitude: number, options: LookupOptions): LookupRequest {
    return {
      point: GeoPoint.create(latitude, longitude),
      zoom: ZoomLevel.create(options.zoom ?? CLIENT.defaultZoom),
      providers: options.providers === undefined ? null : providerIds(options.providers),
      credentials: this.#credentials,
      signal: options.signal ?? null,
    };
  }
}
