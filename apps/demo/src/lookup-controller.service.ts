import { createImageryDateClient, ProviderId, type ImageryDateClient, type ImageryDateReport } from 'imagery-date';
import { element } from './element.function.ts';
import type { LookupSettings } from './lookup-settings.interface.ts';
import { renderReport } from './render-report.function.ts';
import { WEB } from './web.constants.ts';
import { WEB_COPY } from './web.copy.ts';

/**
 * Runs one lookup at a time into the results panel: a new click cancels the one in flight, so a slow provider never
 * paints an old point over a new one. One client per key, so repeated clicks reuse its cache.
 */
export class LookupController {
  readonly #results: HTMLElement;
  #client: { key: string; client: ImageryDateClient } | null = null;
  #running: AbortController | null = null;

  constructor(results: HTMLElement) {
    this.#results = results;
    this.#results.replaceChildren(element(WEB.tags.p, WEB.classes.muted, WEB_COPY.idle));
  }

  lookup(latitude: number, longitude: number, settings: LookupSettings): Promise<void> {
    const client = this.#clientFor(settings.googleKey);
    const named = settings.solar
      ? [...client.providers.filter((p) => p.enabledByDefault && !p.billable).map((p) => p.id), ProviderId.GoogleSolar]
      : null;
    const options = named === null ? { zoom: settings.zoom } : { zoom: settings.zoom, providers: named };
    const text = WEB_COPY.loading(latitude.toFixed(WEB.coordinateDecimals), longitude.toFixed(WEB.coordinateDecimals));
    return this.#run(text, (signal) => client.lookup(latitude, longitude, { ...options, signal }));
  }

  history(latitude: number, longitude: number, settings: LookupSettings): Promise<void> {
    const client = this.#clientFor(settings.googleKey);
    return this.#run(WEB_COPY.loadingHistory, (signal) =>
      client.history(latitude, longitude, { zoom: settings.zoom, signal }),
    );
  }

  async #run(waiting: string, work: (signal: AbortSignal) => Promise<ImageryDateReport>): Promise<void> {
    this.#running?.abort();
    const running = new AbortController();
    this.#running = running;
    this.#results.replaceChildren(element(WEB.tags.p, WEB.classes.loading, waiting));
    try {
      const report = await work(running.signal);
      if (!running.signal.aborted)
        this.#results.replaceChildren(...renderReport(report, this.#clientFor(null).providers));
    } catch (error: unknown) {
      if (!running.signal.aborted)
        this.#results.replaceChildren(element(WEB.tags.p, WEB.classes.note, WEB_COPY.failed(String(error))));
    }
  }

  #clientFor(key: string | null): ImageryDateClient {
    if (this.#client !== null && (key === null || this.#client.key === key)) return this.#client.client;
    const googleKey = key ?? '';
    const client = createImageryDateClient(googleKey === '' ? {} : { credentials: { google: googleKey } });
    this.#client = { key: googleKey, client };
    return client;
  }
}
