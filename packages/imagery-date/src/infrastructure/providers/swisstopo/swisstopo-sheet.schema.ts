import * as z from 'zod/mini';

/** One map sheet's metadata: `datenstand` is the flight year, `resolution` the pixel (`10 cm`). */
export const swisstopoSheetSchema = z.object({
  datenstand: z.union([z.string(), z.number()]),
  resolution: z.optional(z.nullable(z.string())),
});
