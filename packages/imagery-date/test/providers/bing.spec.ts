import { describe, expect, it } from 'vitest';
import { HttpMethod } from '../../src/application/ports/http-method.enum.ts';
import { DatePrecision } from '../../src/domain/capture/date-precision.enum.ts';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { ImageryDateReport } from '../../src/domain/outcome/imagery-date-report.interface.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { recordedClient } from '../support/recorded-client.function.ts';
import { scriptedExchange } from '../support/scripted-exchange.function.ts';

const recording = loadRecording(ProviderId.Bing, 'notre-dame-paris');
const only = { providers: [ProviderId.Bing] };
const request = { method: HttpMethod.Head, url: recording.exchanges[0]?.request.url ?? '' };
const lookup = (exchanges: readonly RecordedExchange[], zoom = 19): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.lookup(recording.latitude, recording.longitude, { ...only, zoom });

describe('Bing Maps Aerial (recorded at Notre-Dame de Paris)', () => {
  it('states the capture range of the tile as a range, never as a single day, without downloading the photo', async () => {
    const { client, http } = recordedClient(recording.exchanges);
    const report = await client.lookup(recording.latitude, recording.longitude, only);
    const capture = report.outcomes[0]?.captures[0];
    expect(capture?.date.toJSON()).toEqual({
      value: '2021-06-16/2021-10-08',
      precision: DatePrecision.Range,
      start: '2021-06-16',
      end: '2021-10-08',
    });
    expect(capture?.zoomRange?.toJSON()).toEqual({ minimum: 19, maximum: 19 });
    expect(http.sent[0]?.method).toBe(HttpMethod.Head);
  });

  it('asks deeper zooms at 19, where its aerial layer is complete', async () => {
    const report = await lookup(recording.exchanges, 21);
    expect(report.outcomes[0]?.captures[0]?.zoomRange?.toJSON()).toEqual({ minimum: 19, maximum: 19 });
  });

  it('has no date when the tile is missing or carries no capture header', async () => {
    expect((await lookup([scriptedExchange(request, 404, '')])).outcomes[0]?.status).toBe(OutcomeStatus.NoDate);
    expect((await lookup([scriptedExchange(request, 200, '')])).outcomes[0]?.status).toBe(OutcomeStatus.NoDate);
  });

  it('refuses a capture header it cannot read, and a refused request', async () => {
    const odd = scriptedExchange(request, 200, '', { 'x-ve-tilemeta-capturedatesrange': '2021-06-16' });
    expect((await lookup([odd])).outcomes[0]?.failure).toEqual({
      code: FailureCode.InvalidResponse,
      detail: 'Bing sent a capture range this library cannot read: 2021-06-16',
    });
    expect((await lookup([scriptedExchange(request, 400, '')])).outcomes[0]?.failure?.code).toBe(
      FailureCode.HttpStatus,
    );
  });
});
