import { describe, expect, it } from 'vitest';
import { HttpMethod } from '../application/ports/http-method.enum.ts';
import { FailureCode } from '../domain/outcome/failure-code.enum.ts';
import { RecordedHttpClient } from '../testing/recorded-http-client.fake.ts';
import { UnrecordedRequestError } from '../testing/unrecorded-request.error.ts';
import { SystemClock } from './clock/system-clock.adapter.ts';
import { ThrottledHttpClient } from './http/throttled-http-client.adapter.ts';
import { SystemRandom } from './random/system-random.adapter.ts';

describe(`${SystemClock.name} and ${SystemRandom.name}`, () => {
  it('reads the real time as an ISO instant and waits on a real timer', async () => {
    const clock = new SystemClock();
    const now = clock.now();
    expect(now.iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    await expect(clock.wait(1, null)).resolves.toBeUndefined();
    expect(clock.now().epochMilliseconds).toBeGreaterThanOrEqual(now.epochMilliseconds);
  });

  it('stops waiting when the signal fires, before or during the wait', async () => {
    const clock = new SystemClock();
    await expect(clock.wait(10_000, AbortSignal.abort())).rejects.toMatchObject({
      failure: { code: FailureCode.Aborted },
    });
    const controller = new AbortController();
    const waiting = clock.wait(10_000, controller.signal);
    controller.abort();
    await expect(waiting).rejects.toMatchObject({ failure: { code: FailureCode.Aborted } });
    const value = new SystemRandom().next();
    expect(value >= 0 && value < 1).toBe(true);
  });
});

describe(ThrottledHttpClient.name, () => {
  it('passes requests through, and the recorded client names a request it has no answer for', async () => {
    const inner = new RecordedHttpClient([]);
    const throttled = new ThrottledHttpClient(inner, 1);
    const request = { method: HttpMethod.Get, url: new URL('https://a.example/x?key=secret'), signal: null };
    await expect(throttled.send(request)).rejects.toBeInstanceOf(UnrecordedRequestError);
    await expect(throttled.send(request)).rejects.toThrow('No recorded response for GET https://a.example/x');
    expect(inner.sent).toHaveLength(2);
  });
});
