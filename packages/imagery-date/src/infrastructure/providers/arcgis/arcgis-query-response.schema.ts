import * as z from 'zod/mini';
import { esriImageryAttributesSchema } from './esri-imagery-attributes.schema.ts';

/** ArcGIS answers a query with features, or with HTTP 200 and an `error` object. */
export const arcgisQueryResponseSchema = z.object({
  features: z.optional(z.array(z.object({ attributes: esriImageryAttributesSchema }))),
  error: z.optional(z.object({ code: z.number(), message: z.string() })),
});
