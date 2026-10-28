import * as z from 'zod/mini';

/** The nearest panorama: its month or year, where it stands and whose photo it is. */
export const streetViewMetadataResponseSchema = z.object({
  status: z.string(),
  date: z.optional(z.string()),
  location: z.optional(z.object({ lat: z.number(), lng: z.number() })),
  copyright: z.optional(z.string()),
  error_message: z.optional(z.string()),
});
