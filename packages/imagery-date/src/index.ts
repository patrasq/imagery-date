// imagery-date: when was the map photo at this point taken? The public API; nothing else is supported.

// The client
export { createImageryDateClient } from './composition/create-imagery-date-client.function.ts';
export type { ImageryDateClient } from './composition/imagery-date-client.interface.ts';
export type { ImageryDateClientOptions } from './composition/imagery-date-client-options.interface.ts';
export type { LookupOptions } from './composition/lookup-options.interface.ts';
export type { HistoryOptions } from './composition/history-options.interface.ts';
export type { BatchOptions } from './composition/batch-options.interface.ts';
export type { PointInput } from './composition/point-input.interface.ts';

// What a lookup returns
export type { ImageryDateReport } from './domain/outcome/imagery-date-report.interface.ts';
export type { ProviderOutcome } from './domain/outcome/provider-outcome.interface.ts';
export type { ProviderFailure } from './domain/outcome/provider-failure.interface.ts';
export type { BatchResult } from './application/batch/batch-result.interface.ts';
export type { Capture } from './domain/capture/capture.interface.ts';
export { CaptureDate } from './domain/capture/capture-date.value-object.ts';
export { CalendarDay } from './domain/calendar/calendar-day.value-object.ts';
export { ZoomRange } from './domain/geo/zoom-range.value-object.ts';
export { GeoPoint } from './domain/geo/geo-point.value-object.ts';
export { ZoomLevel } from './domain/geo/zoom-level.value-object.ts';
export { BoundingBox } from './domain/geo/bounding-box.value-object.ts';
export { TileCoordinate } from './domain/geo/tile-coordinate.value-object.ts';
export { distanceInMetres } from './domain/geo/distance-in-metres.function.ts';

// Value sets
export { DatePrecision } from './domain/capture/date-precision.enum.ts';
export type { DatePrecisionValue } from './domain/capture/date-precision.type.ts';
export { OutcomeStatus } from './domain/outcome/outcome-status.enum.ts';
export type { OutcomeStatusValue } from './domain/outcome/outcome-status.type.ts';
export { FailureCode } from './domain/outcome/failure-code.enum.ts';
export type { FailureCodeValue } from './domain/outcome/failure-code.type.ts';
export { ProviderId } from './domain/provider/provider-id.enum.ts';
export type { ProviderIdValue } from './domain/provider/provider-id.type.ts';
export { TermsClass } from './domain/provider/terms-class.enum.ts';
export type { TermsClassValue } from './domain/provider/terms-class.type.ts';
export { CredentialKind } from './domain/provider/credential-kind.enum.ts';
export type { CredentialKindValue } from './domain/provider/credential-kind.type.ts';
export type { Credentials } from './domain/provider/credentials.type.ts';
export type { ProviderDescriptor } from './domain/provider/provider-descriptor.interface.ts';
export { ErrorCode } from './domain/errors/error-code.enum.ts';
export type { ErrorCodeValue } from './domain/errors/error-code.type.ts';
export type { Instant } from './domain/time/instant.interface.ts';

// Errors
export { ImageryDateError } from './domain/errors/imagery-date.error.ts';
export { InvalidCoordinatesError } from './domain/errors/invalid-coordinates.error.ts';
export { InvalidZoomError } from './domain/errors/invalid-zoom.error.ts';
export { InvalidCalendarDayError } from './domain/errors/invalid-calendar-day.error.ts';
export { InvalidDateRangeError } from './domain/errors/invalid-date-range.error.ts';
export { UnknownProviderError } from './domain/errors/unknown-provider.error.ts';
export { ProviderFailureError } from './application/errors/provider-failure.error.ts';

// Ports, to plug in your own HTTP stack, clock or randomness
export { HttpClient } from './application/ports/http-client.port.ts';
export type { HttpRequest } from './application/ports/http-request.interface.ts';
export type { HttpResponse } from './application/ports/http-response.interface.ts';
export { HttpMethod } from './application/ports/http-method.enum.ts';
export type { HttpMethodValue } from './application/ports/http-method.type.ts';
export { Clock } from './application/ports/clock.port.ts';
export { RandomSource } from './application/ports/random-source.port.ts';
export { ImageryDateProvider } from './application/ports/imagery-date-provider.port.ts';
export type { ProviderQuery } from './application/ports/provider-query.interface.ts';

// The default HTTP stack's parts, to compose your own (a proxy in front of fetch, a larger cache)
export { FetchHttpClient } from './infrastructure/http/fetch-http-client.adapter.ts';
export type { FetchHttpClientOptions } from './infrastructure/http/fetch-http-client-options.interface.ts';
export { CachingHttpClient } from './infrastructure/http/caching-http-client.adapter.ts';
export { RetryingHttpClient } from './infrastructure/http/retrying-http-client.adapter.ts';
export { ThrottledHttpClient } from './infrastructure/http/throttled-http-client.adapter.ts';
export { SystemClock } from './infrastructure/clock/system-clock.adapter.ts';
export { SystemRandom } from './infrastructure/random/system-random.adapter.ts';
