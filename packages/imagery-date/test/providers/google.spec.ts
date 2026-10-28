import { describe, expect, it } from 'vitest';
import { HttpMethod } from '../../src/application/ports/http-method.enum.ts';
import { DatePrecision } from '../../src/domain/capture/date-precision.enum.ts';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import type { ImageryDateReport } from '../../src/domain/outcome/imagery-date-report.interface.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { Recording } from '../../src/testing/recording.interface.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { recordedClient } from '../support/recorded-client.function.ts';
import { scriptedExchange } from '../support/scripted-exchange.function.ts';

const street = loadRecording(ProviderId.GoogleStreetView, 'paris-14e-street');
const sphere = loadRecording(ProviderId.GoogleStreetView, 'paris-15e-contributed');
const solar = loadRecording(ProviderId.GoogleSolar, 'palace-of-parliament-bucharest');
const lookup = (
  at: Recording,
  provider: string,
  exchanges: readonly RecordedExchange[] = at.exchanges,
): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.lookup(at.latitude, at.longitude, { providers: [provider] });
const answered = (at: Recording, provider: string, status: number, body: object): Promise<ImageryDateReport> => {
  const request = { method: HttpMethod.Get, url: at.exchanges[0]?.request.url ?? '' };
  return lookup(at, provider, [scriptedExchange(request, status, JSON.stringify(body))]);
};

describe('Google Street View (recorded in Paris)', () => {
  it("states the month of Google's own panorama, its distance and its credit", async () => {
    const capture = (await lookup(street, ProviderId.GoogleStreetView)).outcomes[0]?.captures[0];
    expect([capture?.date.value, capture?.date.precision, capture?.product, capture?.attribution]).toEqual([
      '2025-07',
      DatePrecision.Month,
      'Street View',
      '© 2026 Google',
    ]);
    expect(capture?.distanceMetres).toBeLessThanOrEqual(50);
  });

  it("names a photo sphere someone else owns for what it is, with that owner's credit", async () => {
    const capture = (await lookup(sphere, ProviderId.GoogleStreetView)).outcomes[0]?.captures[0];
    expect([capture?.date.value, capture?.product, capture?.attribution]).toEqual([
      '2024-12',
      'Street View photo by a contributor',
      '© Go360',
    ]);
  });
});

describe('Google Street View: statuses', () => {
  const status = async (body: object): Promise<ImageryDateReport['outcomes'][number] | undefined> =>
    (await answered(street, ProviderId.GoogleStreetView, 200, body)).outcomes[0];

  it('has no date where there is no panorama, and is refused with a denied key', async () => {
    expect((await status({ status: 'ZERO_RESULTS' }))?.status).toBe(OutcomeStatus.NoDate);
    expect((await status({ status: 'REQUEST_DENIED', error_message: 'API not enabled' }))?.failure).toEqual({
      code: FailureCode.Refused,
      detail: 'Street View answered REQUEST_DENIED: API not enabled',
    });
  });

  it('refuses a status or a date it does not know', async () => {
    expect((await status({ status: 'SOMETHING_NEW' }))?.failure?.code).toBe(FailureCode.InvalidResponse);
    expect((await status({ status: 'OK', date: 'summer' }))?.failure?.code).toBe(FailureCode.InvalidResponse);
  });
});

describe('Google Solar API (recorded at the Palace of the Parliament, Bucharest)', () => {
  it('states the day of the aerial photo it analysed, its quality and the building centre distance', async () => {
    const capture = (await lookup(solar, ProviderId.GoogleSolar)).outcomes[0]?.captures[0];
    expect([capture?.date.value, capture?.product, capture?.distanceMetres]).toEqual([
      '2021-07-28',
      'Solar API imagery (HIGH)',
      4,
    ]);
  });

  it('never runs unless named, because Google bills it', async () => {
    const { client, http } = recordedClient([]);
    const report = await client.lookup(solar.latitude, solar.longitude, { providers: [ProviderId.IgnFrance] });
    expect(report.outcomes.map((outcome) => outcome.provider)).not.toContain(ProviderId.GoogleSolar);
    expect(http.sent).toHaveLength(0);
  });

  it('has no date where Google has no building, and is refused with a denied key', async () => {
    expect((await answered(solar, ProviderId.GoogleSolar, 404, {})).outcomes[0]?.status).toBe(OutcomeStatus.NoDate);
    expect((await answered(solar, ProviderId.GoogleSolar, 403, {})).outcomes[0]?.failure?.code).toBe(
      FailureCode.Refused,
    );
  });
});
