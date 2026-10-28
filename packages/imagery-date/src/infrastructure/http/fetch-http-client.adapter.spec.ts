import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HttpMethod } from '../../application/ports/http-method.enum.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { FetchHttpClient } from './fetch-http-client.adapter.ts';

const ROUTES: Record<string, (request: IncomingMessage, response: ServerResponse) => void> = {
  '/ok': (request, response) => {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Echo-Agent': request.headers['user-agent'] ?? '',
    });
    response.end('{"ok":true}');
  },
  '/silent': () => undefined,
};

let server: Server;
let base = '';
beforeAll(async () => {
  server = createServer((request, response) => ROUTES[request.url ?? '']?.(request, response));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('the test server has no port');
  base = `http://127.0.0.1:${String(address.port)}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

describe(FetchHttpClient.name, () => {
  const client = new FetchHttpClient({ timeoutMilliseconds: 200, userAgent: 'imagery-date-test' });

  it('returns the status, lower-cased headers and the body, and sends the user agent', async () => {
    const response = await client.send({ method: HttpMethod.Get, url: new URL(`${base}/ok`), signal: null });
    expect([response.status, response.body, response.headers.get('x-echo-agent')]).toEqual([
      200,
      '{"ok":true}',
      'imagery-date-test',
    ]);
    const head = await client.send({ method: HttpMethod.Head, url: new URL(`${base}/ok`), signal: null });
    expect([head.status, head.body]).toEqual([200, '']);
  });

  it('turns no answer into timeout, a cancelled lookup into aborted and a closed port into network', async () => {
    const silent = { method: HttpMethod.Get, url: new URL(`${base}/silent`), signal: null };
    await expect(client.send({ ...silent, timeoutMilliseconds: 50 })).rejects.toMatchObject({
      failure: { code: FailureCode.Timeout, detail: `127.0.0.1:${new URL(base).port} did not answer within 50 ms.` },
    });
    const controller = new AbortController();
    const cancelled = client.send({ ...silent, signal: controller.signal });
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ failure: { code: FailureCode.Aborted } });
    await expect(client.send({ ...silent, url: new URL('http://127.0.0.1:9/') })).rejects.toMatchObject({
      failure: { code: FailureCode.Network },
    });
  });
});
