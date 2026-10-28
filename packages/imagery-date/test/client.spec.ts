import { describe, expect, it } from 'vitest';
import { createImageryDateClient } from '../src/composition/create-imagery-date-client.function.ts';
import { ErrorCode } from '../src/domain/errors/error-code.enum.ts';
import { InvalidCoordinatesError } from '../src/domain/errors/invalid-coordinates.error.ts';
import { UnknownProviderError } from '../src/domain/errors/unknown-provider.error.ts';
import { ProviderId } from '../src/domain/provider/provider-id.enum.ts';
import { loadRecording } from './support/load-recording.function.ts';
import { recordedClient } from './support/recorded-client.function.ts';

const ign = loadRecording(ProviderId.IgnFrance, 'notre-dame-paris');

describe('createImageryDateClient', () => {
  it('lists its providers in report order, national surveys first', () => {
    expect(createImageryDateClient().providers.map((provider) => provider.id)).toEqual([
      ProviderId.IgnFrance,
      ProviderId.Swisstopo,
      ProviderId.EsriWorldImagery,
      ProviderId.Bing,
      ProviderId.EsriWayback,
      ProviderId.GoogleStreetView,
      ProviderId.GoogleSolar,
    ]);
  });

  it('rejects refused input as a promise rejection, never a synchronous throw', async () => {
    const { client } = recordedClient([]);
    const lookup = client.lookup(95, 0);
    await expect(lookup).rejects.toBeInstanceOf(InvalidCoordinatesError);
    await expect(client.lookup(48, 2, { providers: ['apple-maps'] })).rejects.toBeInstanceOf(UnknownProviderError);
    await expect(client.lookup(48, 2, { providers: ['apple-maps'] })).rejects.toThrow(
      /Known providers: ign-france, swisstopo/,
    );
  });
});

describe('createImageryDateClient: batches and cancellation', () => {
  it('reports a batch in input order, a refused point carrying its error, and keeps going', async () => {
    const { client, http } = recordedClient(ign.exchanges);
    const points = [
      { key: 'first', latitude: ign.latitude, longitude: ign.longitude },
      { key: 'broken', latitude: Number.NaN, longitude: 2 },
      { key: 'again', latitude: ign.latitude, longitude: ign.longitude, zoom: 19 },
    ];
    const results = [];
    for await (const result of client.lookupMany(points, { providers: [ProviderId.IgnFrance], concurrency: 2 }))
      results.push(result);
    expect(
      results.map((result) => [result.key, result.report?.newest?.date.value ?? null, result.error?.code ?? null]),
    ).toEqual([
      ['first', '2024-08-27', null],
      ['broken', null, ErrorCode.InvalidCoordinates],
      ['again', '2024-08-27', null],
    ]);
    expect(http.sent).toHaveLength(2);
  });

  it('cancels a lookup through its signal: the providers report "aborted", the lookup still answers', async () => {
    const controller = new AbortController();
    controller.abort();
    const { client } = recordedClient(ign.exchanges);
    const report = await client.lookup(ign.latitude, ign.longitude, {
      providers: [ProviderId.IgnFrance],
      signal: controller.signal,
    });
    expect(report.outcomes).toHaveLength(1);
  });
});
