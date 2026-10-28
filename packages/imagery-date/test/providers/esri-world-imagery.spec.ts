import { describe, expect, it } from 'vitest';
import { HttpMethod } from '../../src/application/ports/http-method.enum.ts';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import type { ImageryDateReport } from '../../src/domain/outcome/imagery-date-report.interface.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { Recording } from '../../src/testing/recording.interface.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { recordedClient } from '../support/recorded-client.function.ts';
import { scriptedExchange } from '../support/scripted-exchange.function.ts';

const copenhagen = loadRecording(ProviderId.EsriWorldImagery, 'copenhagen-city-hall');
const ocean = loadRecording(ProviderId.EsriWorldImagery, 'mid-atlantic');
const request = { method: HttpMethod.Get, url: copenhagen.exchanges[0]?.request.url ?? '' };
const lookup = (
  at: Recording,
  exchanges: readonly RecordedExchange[] = at.exchanges,
  zoom = 19,
): Promise<ImageryDateReport> =>
  recordedClient(exchanges).client.lookup(at.latitude, at.longitude, {
    providers: [ProviderId.EsriWorldImagery],
    zoom,
  });

describe('Esri World Imagery (recorded at Copenhagen City Hall)', () => {
  it('states each photo once with the zooms that show it, leaving the undated world mosaic out', async () => {
    const captures = (await lookup(copenhagen)).outcomes[0]?.captures ?? [];
    expect(
      captures.map((capture) => [
        capture.date.value,
        capture.product,
        capture.resolutionMetres,
        capture.zoomRange?.toJSON(),
      ]),
    ).toEqual([
      ['2025-03-21', 'Vivid Advanced', 0.5, { minimum: 12, maximum: 19 }],
      ['2012-01-15', 'Denmark_2012', 0.1, { minimum: 20, maximum: 20 }],
    ]);
  });

  it('picks the newest photo shown at the zoom asked about, not the newest anywhere', async () => {
    expect((await lookup(copenhagen)).newest?.date.value).toBe('2025-03-21');
    expect((await lookup(copenhagen, copenhagen.exchanges, 20)).newest?.date.value).toBe('2012-01-15');
  });

  it('has no dated photo in the open ocean', async () => {
    const report = await lookup(ocean);
    expect(report.outcomes[0]?.status).toBe(OutcomeStatus.NoDate);
    expect(report.newest).toBeNull();
  });
});

describe('Esri World Imagery: answers that carry no date', () => {
  it('reports an ArcGIS error sent with HTTP 200', async () => {
    const error = scriptedExchange(request, 200, JSON.stringify({ error: { code: 498, message: 'Invalid token.' } }));
    expect((await lookup(copenhagen, [error])).outcomes[0]?.failure).toEqual({
      code: FailureCode.HttpStatus,
      detail: 'services.arcgisonline.com answered with error 498: Invalid token.',
    });
  });

  it('reports a body that is not JSON, and an impossible capture date', async () => {
    expect((await lookup(copenhagen, [scriptedExchange(request, 200, '<html>')])).outcomes[0]?.failure?.code).toBe(
      FailureCode.InvalidResponse,
    );
    const impossible = JSON.stringify({ features: [{ attributes: { SRC_DATE: 20251399 } }] });
    const outcome = (await lookup(copenhagen, [scriptedExchange(request, 200, impossible)])).outcomes[0];
    expect(outcome?.failure).toEqual({
      code: FailureCode.InvalidResponse,
      detail: 'services.arcgisonline.com published an impossible capture date: 20251399.',
    });
  });
});
