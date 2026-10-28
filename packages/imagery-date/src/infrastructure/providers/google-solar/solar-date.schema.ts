import * as z from 'zod/mini';

/** Google's Date: a month or day it does not know is 0 or left out. */
export const solarDateSchema = z.object({
  year: z.number(),
  month: z.optional(z.number()),
  day: z.optional(z.number()),
});
