import * as z from 'zod/mini';

/** The field of `codex execpolicy check` output the check reads; absent when no rule matches. */
export const execpolicyResultSchema = z.object({ decision: z.optional(z.string()) });
