import { createImageryDateClient } from '../../src/composition/create-imagery-date-client.function.ts';
import type { ImageryDateClient } from '../../src/composition/imagery-date-client.interface.ts';
import { FixedClock } from '../../src/testing/fixed-clock.fake.ts';
import type { RecordedExchange } from '../../src/testing/recorded-exchange.interface.ts';
import { RecordedHttpClient } from '../../src/testing/recorded-http-client.fake.ts';
import { SequenceRandom } from '../../src/testing/sequence-random.fake.ts';
import { SUPPORT } from './support.constants.ts';

interface RecordedClient {
  readonly client: ImageryDateClient;
  readonly http: RecordedHttpClient;
}

/** A client whose network is the given exchanges, with a fixed clock and a Google key that is not real. */
export function recordedClient(exchanges: readonly RecordedExchange[]): RecordedClient {
  const http = new RecordedHttpClient(exchanges);
  const client = createImageryDateClient({
    httpClient: http,
    clock: new FixedClock(SUPPORT.epochMilliseconds),
    random: new SequenceRandom(),
    credentials: { google: SUPPORT.googleKey },
  });
  return { client, http };
}
