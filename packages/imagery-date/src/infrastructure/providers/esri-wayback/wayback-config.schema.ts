import * as z from 'zod/mini';

/** `waybackconfig.json`: release number → release. */
export const waybackConfigSchema = z.record(
  z.string(),
  z.object({
    itemTitle: z.string(),
    metadataLayerUrl: z.string(),
  }),
);
