import { ProviderId } from '../src/domain/provider/provider-id.enum.ts';
import type { ProviderIdValue } from '../src/domain/provider/provider-id.type.ts';

interface RecordingCase {
  readonly provider: ProviderIdValue;
  readonly slug: string;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom: number;
}

/** Public landmarks only. Re-record with `pnpm record` when a provider changes its service. */
export const RECORDING = Object.freeze({
  directory: 'test/recordings',
  environment: Object.freeze({ googleKey: 'IMAGERY_DATE_GOOGLE_KEY', only: 'IMAGERY_DATE_RECORD_ONLY' }),
  extension: '.recording.json',
  userAgent: 'imagery-date-recorder (+https://github.com/patrasq/imagery-date)',
  timeoutMilliseconds: 30_000,
  indentation: 2,
  keptHeaders: new Set([
    'content-type',
    'retry-after',
    'x-ve-tilemeta-capturedatesrange',
    'x-ve-tilemeta-capturedatemaxyymm',
    'x-ve-tilemeta-product-ids',
  ]),
  summary: (slug: string, status: string, dates: readonly string[]) => `${slug}: ${status} ${dates.join(', ')}\n`,
  cases: Object.freeze<RecordingCase[]>([
    {
      provider: ProviderId.IgnFrance,
      slug: 'notre-dame-paris',
      name: 'Notre-Dame de Paris',
      latitude: 48.853,
      longitude: 2.3499,
      zoom: 19,
    },
    {
      provider: ProviderId.Swisstopo,
      slug: 'zurich-main-station',
      name: 'Zürich main station',
      latitude: 47.3779,
      longitude: 8.5403,
      zoom: 19,
    },
    {
      provider: ProviderId.EsriWorldImagery,
      slug: 'copenhagen-city-hall',
      name: 'Copenhagen City Hall',
      latitude: 55.6761,
      longitude: 12.5683,
      zoom: 19,
    },
    {
      provider: ProviderId.EsriWorldImagery,
      slug: 'mid-atlantic',
      name: 'The Atlantic, west of the Azores',
      latitude: 40,
      longitude: -30,
      zoom: 19,
    },
    {
      provider: ProviderId.Bing,
      slug: 'notre-dame-paris',
      name: 'Notre-Dame de Paris',
      latitude: 48.853,
      longitude: 2.3499,
      zoom: 19,
    },
    {
      provider: ProviderId.EsriWayback,
      slug: 'copenhagen-city-hall',
      name: 'Copenhagen City Hall',
      latitude: 55.6761,
      longitude: 12.5683,
      zoom: 18,
    },
    {
      provider: ProviderId.GoogleStreetView,
      slug: 'paris-14e-street',
      name: 'A street in Paris 14e (a Google panorama)',
      latitude: 48.8335,
      longitude: 2.327,
      zoom: 19,
    },
    {
      provider: ProviderId.GoogleStreetView,
      slug: 'paris-15e-contributed',
      name: 'Paris 15e (a contributed photo sphere)',
      latitude: 48.8414,
      longitude: 2.2995,
      zoom: 19,
    },
    {
      provider: ProviderId.GoogleSolar,
      slug: 'palace-of-parliament-bucharest',
      name: 'Palace of the Parliament, Bucharest',
      latitude: 44.4275,
      longitude: 26.0874,
      zoom: 19,
    },
  ]),
} as const);
