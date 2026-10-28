import * as z from 'zod/mini';
import { ignMosaicFeatureSchema } from './ign-mosaic-feature.schema.ts';

/** GeoJSON of the BD ORTHO mosaic polygons at the point. */
export const ignMosaicResponseSchema = z.object({ features: z.array(ignMosaicFeatureSchema) });
