import * as z from 'zod/mini';

/** One imagery footprint's metadata; a field the service leaves out or nulls is unknown. */
export const esriImageryAttributesSchema = z.object({
  SRC_DATE: z.nullable(z.number()),
  SRC_RES: z.optional(z.nullable(z.number())),
  NICE_NAME: z.optional(z.nullable(z.string())),
  MinMapLevel: z.optional(z.nullable(z.number())),
  MaxMapLevel: z.optional(z.nullable(z.number())),
});
