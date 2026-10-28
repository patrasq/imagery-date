import * as z from 'zod/mini';
import { FailureCode } from '../../src/domain/outcome/failure-code.enum.ts';
import { HttpMethod } from '../../src/application/ports/http-method.enum.ts';

/** A recording file, checked on load so a hand-edited or truncated file fails loudly. */
export const recordingSchema = z.object({
  name: z.string(),
  recordedAt: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  zoom: z.number(),
  exchanges: z.array(
    z.object({
      request: z.object({ method: z.enum(Object.values(HttpMethod)), url: z.string() }),
      response: z.nullable(
        z.object({ status: z.number(), headers: z.record(z.string(), z.string()), body: z.string() }),
      ),
      failure: z.nullable(z.object({ code: z.enum(Object.values(FailureCode)), detail: z.string() })),
    }),
  ),
});
