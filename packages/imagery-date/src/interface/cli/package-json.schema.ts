import * as z from 'zod/mini';

/** The part of the package's own package.json the CLI reads. */
export const packageJsonSchema = z.object({ version: z.string() });
