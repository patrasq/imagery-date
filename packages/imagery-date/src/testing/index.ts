// imagery-date/testing: deterministic fakes of the library's ports, for testing code that uses imagery-date.
export { FixedClock } from './fixed-clock.fake.ts';
export { RecordedHttpClient } from './recorded-http-client.fake.ts';
export type { RecordedExchange } from './recorded-exchange.interface.ts';
export type { Recording } from './recording.interface.ts';
export { recordingKey } from './recording-key.function.ts';
export { SequenceRandom } from './sequence-random.fake.ts';
export { UnrecordedRequestError } from './unrecorded-request.error.ts';
