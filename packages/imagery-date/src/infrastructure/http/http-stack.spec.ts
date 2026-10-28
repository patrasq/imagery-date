import { describe, expect, it } from 'vitest';
import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import { HttpClient } from '../../application/ports/http-client.port.ts';
import { HttpMethod } from '../../application/ports/http-method.enum.ts';
import type { HttpRequest } from '../../application/ports/http-request.interface.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import type { FailureCodeValue } from '../../domain/outcome/failure-code.type.ts';
import type { RecordedExchange } from '../../testing/recorded-exchange.interface.ts';
import { FixedClock } from '../../testing/fixed-clock.fake.ts';
import { RecordedHttpClient } from '../../testing/recorded-http-client.fake.ts';
import { SequenceRandom } from '../../testing/sequence-random.fake.ts';
import { CachingHttpClient } from './caching-http-client.adapter.ts';
import { RetryingHttpClient } from './retrying-http-client.adapter.ts';

const URL_A = 'https://a.example/x';
const get = (url: string, signal: AbortSignal | null = null): HttpRequest => ({
  method: HttpMethod.Get,
  url: new URL(url),
  signal,
});
const answer = (status: number, headers: Record<string, string> = {}): RecordedExchange => ({
  request: { method: HttpMethod.Get, url: URL_A },
  response: { status, headers, body: String(status) },
  failure: null,
});
const noAnswer = (code: FailureCodeValue): RecordedExchange => ({
  request: { method: HttpMethod.Get, url: URL_A },
  response: null,
  failure: { code, detail: code },
});

describe(RetryingHttpClient.name, () => {
  it('retries 503 with full-jitter backoff and returns the first success', async () => {
    const clock = new FixedClock(0);
    const inner = new RecordedHttpClient([answer(503), answer(503), answer(200)]);
    const response = await new RetryingHttpClient(inner, clock, new SequenceRandom([0.5])).send(get(URL_A));
    expect(response.status).toBe(200);
    expect(clock.waits).toEqual([250, 500]);
    expect(inner.sent).toHaveLength(3);
  });

  it("waits the server's Retry-After, and gives up past 30 s", async () => {
    const clock = new FixedClock(0);
    const told = new RecordedHttpClient([answer(429, { 'Retry-After': '2' }), answer(200)]);
    expect((await new RetryingHttpClient(told, clock, new SequenceRandom()).send(get(URL_A))).status).toBe(200);
    expect(clock.waits).toEqual([2000]);
    const tooLong = new RecordedHttpClient([answer(429, { 'retry-after': '120' })]);
    expect((await new RetryingHttpClient(tooLong, clock, new SequenceRandom()).send(get(URL_A))).status).toBe(429);
  });

  it('returns a status that will not change, and the last answer after the last attempt', async () => {
    const clock = new FixedClock(0);
    const notFound = new RecordedHttpClient([answer(404)]);
    expect((await new RetryingHttpClient(notFound, clock, new SequenceRandom()).send(get(URL_A))).status).toBe(404);
    const down = new RecordedHttpClient([answer(502)]);
    expect((await new RetryingHttpClient(down, clock, new SequenceRandom()).send(get(URL_A))).status).toBe(502);
    expect(down.sent).toHaveLength(3);
  });

  it('retries timeouts, rethrows the last one, and never retries a cancellation', async () => {
    const timeouts = new RecordedHttpClient([noAnswer(FailureCode.Timeout)]);
    const retrying = new RetryingHttpClient(timeouts, new FixedClock(0), new SequenceRandom());
    await expect(retrying.send(get(URL_A))).rejects.toMatchObject({ failure: { code: FailureCode.Timeout } });
    expect(timeouts.sent).toHaveLength(3);
    const cancelled = new RecordedHttpClient([noAnswer(FailureCode.Aborted)]);
    await expect(
      new RetryingHttpClient(cancelled, new FixedClock(0), new SequenceRandom()).send(get(URL_A)),
    ).rejects.toBeInstanceOf(ProviderFailureError);
    expect(cancelled.sent).toHaveLength(1);
  });
});

class GatedHttpClient extends HttpClient {
  readonly sent: HttpRequest[] = [];
  readonly #gates: ((response: HttpResponse) => void)[] = [];

  override send(request: HttpRequest): Promise<HttpResponse> {
    this.sent.push(request);
    return new Promise((resolve) => this.#gates.push(resolve));
  }

  open(status: number): void {
    for (const gate of this.#gates.splice(0)) gate({ status, headers: new Map(), body: '' });
  }
}

describe(CachingHttpClient.name, () => {
  it('sends identical requests once, keeps final answers, and forgets retryable ones', async () => {
    const inner = new GatedHttpClient();
    const cache = new CachingHttpClient(inner, 10);
    const both = Promise.all([cache.send(get(URL_A)), cache.send(get(URL_A))]);
    inner.open(200);
    expect((await both).map((response) => response.status)).toEqual([200, 200]);
    await cache.send(get(URL_A));
    expect(inner.sent).toHaveLength(1);
    const failing = cache.send(get('https://a.example/down'));
    inner.open(503);
    await failing;
    const again = cache.send(get('https://a.example/down'));
    inner.open(200);
    expect((await again).status).toBe(200);
    expect(inner.sent).toHaveLength(3);
  });

  it('lets one caller give up without cancelling the others, and drops the least recently used', async () => {
    const inner = new GatedHttpClient();
    const cache = new CachingHttpClient(inner, 1);
    const controller = new AbortController();
    const leaving = cache.send(get(URL_A, controller.signal));
    const staying = cache.send(get(URL_A));
    controller.abort();
    await expect(leaving).rejects.toMatchObject({ failure: { code: FailureCode.Aborted } });
    inner.open(200);
    expect((await staying).status).toBe(200);
    const other = cache.send(get('https://a.example/other'));
    inner.open(200);
    await other;
    const refetched = cache.send(get(URL_A));
    inner.open(200);
    await refetched;
    expect(inner.sent.map((request) => request.signal)).toEqual([null, null, null]);
  });
});
