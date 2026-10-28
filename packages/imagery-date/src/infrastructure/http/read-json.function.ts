import * as z from 'zod/mini';
import { ProviderFailureError } from '../../application/errors/provider-failure.error.ts';
import type { HttpResponse } from '../../application/ports/http-response.interface.ts';
import { FailureCode } from '../../domain/outcome/failure-code.enum.ts';
import { HTTP } from './http.constants.ts';
import { HTTP_COPY } from './http.copy.ts';

const parseText = (text: string, host: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    throw new ProviderFailureError(FailureCode.InvalidResponse, HTTP_COPY.notJson(host));
  }
};

/**
 * The body of a successful response, checked against the provider's schema: every response is untrusted until it
 * matches. @throws ProviderFailureError `http-status` for a non-2xx status, `invalid-response` for any other shape.
 */
export function readJson<Schema extends z.ZodMiniType>(
  response: HttpResponse,
  host: string,
  schema: Schema,
): z.infer<Schema> {
  if (response.status < HTTP.successMinimum || response.status > HTTP.successMaximum) {
    throw new ProviderFailureError(FailureCode.HttpStatus, HTTP_COPY.status(host, response.status));
  }
  const parsed = schema.safeParse(parseText(response.body, host));
  if (!parsed.success) {
    throw new ProviderFailureError(
      FailureCode.InvalidResponse,
      HTTP_COPY.unexpectedShape(host, z.prettifyError(parsed.error)),
    );
  }
  return parsed.data;
}
