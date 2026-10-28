import * as z from 'zod/mini';
import { CODEX_SETUP as S } from './codex-setup.constants.ts';

/** .codex/hooks.json as this repository writes it: command handlers only. */
export const hooksFileSchema = z.object({
  description: z.optional(z.string()),
  hooks: z.record(
    z.string(),
    z.array(
      z.object({
        matcher: z.optional(z.string()),
        hooks: z.array(
          z.object({
            type: z.literal(S.commandHandler),
            command: z.string(),
            timeout: z.optional(z.number()),
            async: z.optional(z.boolean()),
            statusMessage: z.optional(z.string()),
          }),
        ),
      }),
    ),
  ),
});
