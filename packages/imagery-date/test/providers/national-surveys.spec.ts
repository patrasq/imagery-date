import { describe, expect, it } from 'vitest';
import { HttpMethod } from '../../src/application/ports/http-method.enum.ts';
import { DatePrecision } from '../../src/domain/capture/date-precision.enum.ts';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import type { ImageryDateReport } from '../../src/domain/outcome/imagery-date-report.interface.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { recordedClient } from '../support/recorded-client.function.ts';
import { scriptedExchange } from '../support/scripted-exchange.function.ts';

const ign = loadRecording(ProviderId.IgnFrance, 'notre-dame-paris');
const swiss = loadRecording(ProviderId.Swisstopo, 'zurich-main-station');
const ignRequest = { method: HttpMethod.Get, url: ign.exchanges[0]?.request.url ?? '' };
const lookupIgn = (exchanges: readonly RecordedExchange[]): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.lookup(ign.latitude, ign.longitude, { providers: [ProviderId.IgnFrance] });
const lookupSwiss = (exchanges: readonly RecordedExchange[]): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.lookup(swiss.latitude, swiss.longitude, { providers: [ProviderId.Swisstopo] });

describe('IGN France BD ORTHO (recorded at Notre-Dame de Paris)', () => {
  it('states the flight day, the campaign and the 20 cm pixel, once per flight, asking only for those fields', async () => {
    const { client, http } = recordedClient(ign.exchanges);
    const report = await client.lookup(ign.latitude, ign.longitude, { providers: [ProviderId.IgnFrance] });
    const captures = report.outcomes[0]?.captures ?? [];
    expect(
      captures.map((capture) => [
        capture.date.value,
        capture.date.precision,
        capture.product,
        capture.resolutionMetres,
      ]),
    ).toEqual([['2024-08-27', DatePrecision.Day, 'BD ORTHO 2024', 0.2]]);
    expect(http.sent[0]?.url.searchParams.get('PROPERTYNAME')).toBe('date_vol,res,pva');
  });

  it('is not called outside France', async () => {
    const { client, http } = recordedClient([]);
    const report = await client.lookup(40.4168, -3.7038, { providers: [ProviderId.IgnFrance] });
    expect(report.outcomes[0]?.status).toBe(OutcomeStatus.OutsideCoverage);
    expect(http.sent).toHaveLength(0);
  });
});

describe('IGN France BD ORTHO: answers that carry no date', () => {
  it('reports an unreadable flight day as a failure, never as a date', async () => {
    const body = JSON.stringify({ features: [{ properties: { date_vol: 'août 2024' } }] });
    const outcome = (await lookupIgn([scriptedExchange(ignRequest, 200, body)])).outcomes[0];
    expect(outcome?.status).toBe(OutcomeStatus.Failed);
    expect(outcome?.failure?.code).toBe(FailureCode.InvalidResponse);
    expect(outcome?.failure?.detail).toContain('août 2024');
  });

  it('reports an HTTP error with the host and status only', async () => {
    const outcome = (await lookupIgn([scriptedExchange(ignRequest, 503, 'down')])).outcomes[0];
    expect(outcome?.failure).toEqual({ code: FailureCode.HttpStatus, detail: 'data.geopf.fr answered with HTTP 503.' });
  });
});

describe('swisstopo SWISSIMAGE (recorded at Zürich main station)', () => {
  it('states the flight year only, as swisstopo publishes it, and the 10 cm pixel', async () => {
    const capture = (await lookupSwiss(swiss.exchanges)).outcomes[0]?.captures[0];
    expect(capture?.date.toJSON()).toEqual({
      value: '2025',
      precision: DatePrecision.Year,
      start: '2025-01-01',
      end: '2025-12-31',
    });
    expect([capture?.product, capture?.resolutionMetres, capture?.attribution]).toEqual([
      'SWISSIMAGE 10 cm',
      0.1,
      '© swisstopo',
    ]);
  });

  it('dates nothing from a sheet without a year', async () => {
    const request = { method: HttpMethod.Get, url: swiss.exchanges[0]?.request.url ?? '' };
    const body = JSON.stringify({ results: [{ attributes: { datenstand: 'unbekannt', resolution: '10 cm' } }] });
    expect((await lookupSwiss([scriptedExchange(request, 200, body)])).outcomes[0]?.status).toBe(OutcomeStatus.NoDate);
  });
});
