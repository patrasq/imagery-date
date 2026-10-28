import * as z from 'zod/mini';

/** `data[0]` is 1 when the release has the tile; `select[0]` is the release whose pixels it shows. */
export const waybackTilemapSchema = z.object({
  data: z.array(z.number()),
  select: z.optional(z.array(z.number())),
});
