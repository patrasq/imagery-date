import { stripVTControlCharacters } from 'node:util';
import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';

/** The end of a command's output without colour codes: as much as the model needs to see what failed. */
export function tailText(text: string): string {
  const lines = stripVTControlCharacters(text).trimEnd().split(H.newline).slice(-H.output.maxLines);
  return lines.join(H.newline).slice(-H.output.maxCharacters);
}
