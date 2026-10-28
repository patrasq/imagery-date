import * as z from 'zod/mini';

/** One mosaic polygon: `date_vol` is the flight day, `res` the pixel in centimetres, `pva` the campaign year. */
export const ignMosaicFeatureSchema = z.object({
  properties: z.object({
    date_vol: z.string(),
    res: z.optional(z.nullable(z.number())),
    pva: z.optional(z.nullable(z.number())),
  }),
});
