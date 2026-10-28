import { describe, expect, it } from 'vitest';
import { CalendarDay } from '../../domain/calendar/calendar-day.value-object.ts';
import type { Capture } from '../../domain/capture/capture.interface.ts';
import { CaptureDate } from '../../domain/capture/capture-date.value-object.ts';
import { BoundingBox } from '../../domain/geo/bounding-box.value-object.ts';
import { GeoPoint } from '../../domain/geo/geo-point.value-object.ts';
import { ZoomLevel } from '../../domain/geo/zoom-level.value-object.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { OutcomeStatus } from '../../domain/outcome/outcome-status.enum.ts';
import { CredentialKind } from '../../domain/provider/credential-kind.enum.ts';
import { ProviderId } from '../../domain/provider/provider-id.enum.ts';
import type { ProviderIdValue } from '../../domain/provider/provider-id.type.ts';
import { FixedClock } from '../../testing/fixed-clock.fake.ts';
import { ProviderFailureError } from '../errors/provider-failure.error.ts';
import type { ImageryDateProvider } from '../ports/imagery-date-provider.port.ts';
import { LookupImageryDates } from './lookup-imagery-dates.service.ts';
import type { LookupRequest } from './lookup-request.interface.ts';
import { StubProvider } from './stub-provider.fixture.ts';

const PARIS = GeoPoint.create(48.853, 2.3499);
const capture = (provider: ProviderIdValue, iso: string): Capture => ({
  provider,
  date: CaptureDate.day(CalendarDay.fromIsoString(iso)),
  product: null,
  resolutionMetres: null,
  zoomRange: null,
  distanceMetres: null,
  publishedOn: null,
  attribution: null,
});
const request = (overrides: Partial<LookupRequest> = {}): LookupRequest => ({
  point: PARIS,
  zoom: ZoomLevel.create(19),
  providers: null,
  credentials: {},
  signal: null,
  ...overrides,
});
const service = (...providers: ImageryDateProvider[]): LookupImageryDates =>
  new LookupImageryDates(new Map(providers.map((provider) => [provider.descriptor.id, provider])), new FixedClock(0));

describe(`${LookupImageryDates.name}: what each provider's outcome says`, () => {
  it('reports found and no-date answers, the newest photo and when it asked', async () => {
    const ign = StubProvider.answering(ProviderId.IgnFrance, [capture(ProviderId.IgnFrance, '2024-08-27')]);
    const bing = StubProvider.answering(ProviderId.Bing, []);
    const report = await service(ign, bing).lookup(request());
    expect(report.observedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(report.outcomes.map((outcome) => [outcome.provider, outcome.status])).toEqual([
      [ProviderId.IgnFrance, OutcomeStatus.Found],
      [ProviderId.Bing, OutcomeStatus.NoDate],
    ]);
    expect(report.newest?.date.value).toBe('2024-08-27');
    expect(ign.queries[0]?.point).toBe(PARIS);
  });

  it('keeps a typed failure as that provider outcome and still answers with the others', async () => {
    const failing = new StubProvider(ProviderId.Bing, () =>
      Promise.reject(new ProviderFailureError(FailureCode.Timeout, 'no answer in 15 s')),
    );
    const crashing = new StubProvider(ProviderId.Swisstopo, () => Promise.reject(new TypeError('boom')));
    const working = StubProvider.answering(ProviderId.IgnFrance, [capture(ProviderId.IgnFrance, '2024-08-27')]);
    const report = await service(failing, crashing, working).lookup(request());
    expect(report.outcomes[0]).toMatchObject({ status: OutcomeStatus.Failed, failure: { code: FailureCode.Timeout } });
    expect(report.outcomes[1]).toMatchObject({
      failure: { code: FailureCode.Unexpected, detail: 'Unexpected error: boom' },
    });
    expect(report.outcomes[2]?.status).toBe(OutcomeStatus.Found);
  });

  it('does not call a provider outside its coverage', async () => {
    const swiss = StubProvider.answering(ProviderId.Swisstopo);
    const covered = new StubProvider(ProviderId.Swisstopo, () => Promise.resolve([]), {
      coverage: [BoundingBox.of({ south: 45.8, west: 5.9, north: 47.9, east: 10.5 })],
    });
    const report = await service(covered).lookup(request());
    expect(report.outcomes[0]?.status).toBe(OutcomeStatus.OutsideCoverage);
    expect(covered.queries).toHaveLength(0);
    expect(swiss.queries).toHaveLength(0);
  });
});

describe(`${LookupImageryDates.name}: which providers are asked`, () => {
  const free = StubProvider.answering(ProviderId.EsriWorldImagery);
  const optional = new StubProvider(ProviderId.EsriWayback, () => Promise.resolve([]), { enabledByDefault: false });
  const billable = new StubProvider(ProviderId.GoogleSolar, () => Promise.resolve([]), {
    billable: true,
    enabledByDefault: true,
    credential: CredentialKind.Google,
  });
  const keyed = new StubProvider(ProviderId.GoogleStreetView, () => Promise.resolve([]), {
    credential: CredentialKind.Google,
  });

  it('asks the default providers, never a billable one, and says why a keyed one was skipped', async () => {
    const report = await service(free, optional, billable, keyed).lookup(request());
    expect(report.outcomes.map((outcome) => [outcome.provider, outcome.status])).toEqual([
      [ProviderId.EsriWorldImagery, OutcomeStatus.NoDate],
      [ProviderId.GoogleStreetView, OutcomeStatus.Skipped],
    ]);
    expect(report.outcomes[1]?.failure).toEqual({
      code: FailureCode.MissingCredential,
      detail: 'No Google Maps Platform API key given.',
    });
    expect(billable.queries).toHaveLength(0);
  });

  it('asks only the named providers, in registry order, passing the key', async () => {
    const named = request({
      providers: [ProviderId.GoogleSolar, ProviderId.EsriWayback],
      credentials: { google: 'k' },
    });
    const report = await service(free, optional, billable, keyed).lookup(named);
    expect(report.outcomes.map((outcome) => outcome.provider)).toEqual([
      ProviderId.EsriWayback,
      ProviderId.GoogleSolar,
    ]);
    expect(billable.queries[0]?.credentials).toEqual({ google: 'k' });
  });
});
