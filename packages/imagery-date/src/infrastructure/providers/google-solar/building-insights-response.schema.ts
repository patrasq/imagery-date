import * as z from 'zod/mini';
import { solarDateSchema } from './solar-date.schema.ts';

/** The parts of buildingInsights that date its imagery: the capture day, the quality, the building's centre. */
export const buildingInsightsResponseSchema = z.object({
  imageryDate: solarDateSchema,
  imageryQuality: z.optional(z.string()),
  center: z.optional(z.object({ latitude: z.number(), longitude: z.number() })),
});
