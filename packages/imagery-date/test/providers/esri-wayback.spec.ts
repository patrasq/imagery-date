import { describe, expect, it } from 'vitest';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import type { ImageryDateReport } from '../../src/domain/outcome/imagery-date-report.interface.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { recordedClient } from '../support/recorded-client.function.ts';

const recording = loadRecording(ProviderId.EsriWayback, 'copenhagen-city-hall');
const history = (exchanges: readonly RecordedExchange[] = recording.exchanges): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.history(recording.latitude, recording.longitude, { zoom: recording.zoom });

const HISTORY = [
  ['2025-03-21', 'Vivid Advanced', '2025-09-04'],
  ['2023-04-19', 'Vivid Advanced', '2023-08-10'],
  ['2022-03-11', 'Vivid Advanced', '2022-08-10'],
  ['2021-04-25', 'Metro', '2022-03-16'],
  ['2019-06-05', 'Metro', '2019-12-12'],
  ['2017-05-18', 'Metro', '2018-03-14'],
  ['2015-09-08', '2015-09-08', '2017-05-03'],
  ['2014-03-15', 'Vivid - Europe', '2016-10-25'],
  ['2012-01-15', 'Denmark_2012', '2014-02-20'],
];

const failing = (exchange: RecordedExchange, matches: (body: string) => boolean): RecordedExchange =>
  exchange.response !== null && matches(exchange.response.body)
    ? { ...exchange, response: null, failure: { code: FailureCode.Timeout, detail: 'no answer within 90000 ms.' } }
    : exchange;

describe('Esri World Imagery Wayback (recorded at Copenhagen City Hall)', () => {
  it('lists every photo since 2014 once, newest first, with the first release that published it', async () => {
    const { client, http } = recordedClient(recording.exchanges);
    const report = await client.history(recording.latitude, recording.longitude, { zoom: recording.zoom });
    const captures = report.outcomes[0]?.captures ?? [];
    expect(
      captures.map((capture) => [capture.date.value, capture.product, capture.publishedOn?.toIsoString()]),
    ).toEqual(HISTORY);
    expect(http.sent).toHaveLength(recording.exchanges.length);
  });

  it('keeps archive entries out of "newest": they are history, not what is shown today', async () => {
    expect((await history()).newest).toBeNull();
  });
});

describe('Esri World Imagery Wayback: releases that do not answer', () => {
  it('keeps the photos it did date and says which part is missing', async () => {
    const outcome = (
      await history(recording.exchanges.map((exchange) => failing(exchange, (body) => body.includes('Vivid - Europe'))))
    ).outcomes[0];
    expect(outcome?.status).toBe(OutcomeStatus.Partial);
    expect(outcome?.captures.map((capture) => capture.date.value)).toEqual(
      HISTORY.map(([taken]) => taken).filter((taken) => taken !== '2014-03-15'),
    );
    expect(outcome?.failure).toEqual({
      code: FailureCode.Timeout,
      detail: '1 of 11 archived releases did not answer, so their photos are missing: no answer within 90000 ms.',
    });
  });

  it('fails when no release answers', async () => {
    const outcome = (
      await history(recording.exchanges.map((exchange) => failing(exchange, (body) => body.includes('"features"'))))
    ).outcomes[0];
    expect([outcome?.status, outcome?.captures.length, outcome?.failure?.code]).toEqual([
      OutcomeStatus.Failed,
      0,
      FailureCode.Timeout,
    ]);
  });
});
