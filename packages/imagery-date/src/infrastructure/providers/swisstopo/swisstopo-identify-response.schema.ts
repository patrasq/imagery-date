import * as z from 'zod/mini';
import { swisstopoSheetSchema } from './swisstopo-sheet.schema.ts';

/** The SWISSIMAGE map sheets at the point. */
export const swisstopoIdentifyResponseSchema = z.object({
  results: z.array(z.object({ attributes: swisstopoSheetSchema })),
});
