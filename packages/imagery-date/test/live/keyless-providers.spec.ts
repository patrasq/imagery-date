// Live smoke test: the keyless providers still answer, in the shape this library reads. Hits the real services;
// run by hand with `pnpm test:live` (never in `pnpm verify`), and re-record with `pnpm record` when it fails.
import { describe, expect, it } from 'vitest';
import { createImageryDateClient } from '../../src/composition/create-imagery-date-client.function.ts';
import { OutcomeStatus } from '../../src/domain/outcome/outcome-status.enum.ts';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';

const client = createImageryDateClient({
  userAgent: 'imagery-date-live-test (+https://github.com/patrasq/imagery-date)',
});

describe('keyless providers, live', () => {
  it.each([
    [ProviderId.IgnFrance, 48.853, 2.3499],
    [ProviderId.Swisstopo, 47.3779, 8.5403],
    [ProviderId.EsriWorldImagery, 55.6761, 12.5683],
    [ProviderId.Bing, 48.853, 2.3499],
  ])('%s dates a photo at a landmark', async (provider, latitude, longitude) => {
    const report = await client.lookup(latitude, longitude, { providers: [provider] });
    expect(report.outcomes[0]?.failure).toBeNull();
    expect(report.outcomes[0]?.status).toBe(OutcomeStatus.Found);
  });

  it('esri-wayback lists the history at Copenhagen City Hall', async () => {
    const report = await client.history(55.6761, 12.5683, { zoom: 18 });
    expect([OutcomeStatus.Found, OutcomeStatus.Partial]).toContain(report.outcomes[0]?.status);
    expect(report.outcomes[0]?.captures.length).toBeGreaterThanOrEqual(9);
  });
});
