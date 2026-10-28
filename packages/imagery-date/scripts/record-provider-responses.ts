// Records every provider's real responses at public landmarks into test/recordings, for the recorded tests.
// Run: IMAGERY_DATE_GOOGLE_KEY=… pnpm record   (IMAGERY_DATE_RECORD_ONLY=<provider> to record one provider)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createImageryDateClient } from '../src/composition/create-imagery-date-client.function.ts';
import { SystemClock } from '../src/infrastructure/clock/system-clock.adapter.ts';
import { FetchHttpClient } from '../src/infrastructure/http/fetch-http-client.adapter.ts';
import { HTTP } from '../src/infrastructure/http/http.constants.ts';
import { RetryingHttpClient } from '../src/infrastructure/http/retrying-http-client.adapter.ts';
import { ThrottledHttpClient } from '../src/infrastructure/http/throttled-http-client.adapter.ts';
import { SystemRandom } from '../src/infrastructure/random/system-random.adapter.ts';
import type { Recording } from '../src/testing/recording.interface.ts';
import { RECORDING } from './recording.constants.ts';
import { RECORDING_CONFIG } from './recording.config.ts';
import { RecordingHttpClient } from './recording-http-client.adapter.ts';

const clock = new SystemClock();
const credentials = RECORDING_CONFIG.googleKey === null ? {} : { google: RECORDING_CONFIG.googleKey };
const only = RECORDING_CONFIG.only;
const cases = RECORDING.cases.filter((recordingCase) => only === null || only === recordingCase.provider);

for (const recordingCase of cases) {
  const fetcher = new FetchHttpClient({
    timeoutMilliseconds: RECORDING.timeoutMilliseconds,
    userAgent: RECORDING.userAgent,
  });
  // The library's own stack without its cache: the recording holds each request's final answer, after retries.
  const throttled = new ThrottledHttpClient(fetcher, HTTP.concurrentRequestsPerHost);
  const recorder = new RecordingHttpClient(new RetryingHttpClient(throttled, clock, new SystemRandom()));
  const client = createImageryDateClient({ httpClient: recorder, credentials, clock });
  const options = { zoom: recordingCase.zoom, providers: [recordingCase.provider] };
  const report = await client.lookup(recordingCase.latitude, recordingCase.longitude, options);
  const recording: Recording = {
    name: recordingCase.name,
    recordedAt: report.observedAt,
    latitude: recordingCase.latitude,
    longitude: recordingCase.longitude,
    zoom: recordingCase.zoom,
    exchanges: recorder.exchanges,
  };
  const directory = join(RECORDING.directory, recordingCase.provider);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, recordingCase.slug + RECORDING.extension),
    JSON.stringify(recording, null, RECORDING.indentation),
  );
  const outcome = report.outcomes[0];
  const dates = outcome?.captures.map((capture) => capture.date.value) ?? [];
  process.stdout.write(
    RECORDING.summary(join(recordingCase.provider, recordingCase.slug), outcome?.status ?? '', dates),
  );
}
