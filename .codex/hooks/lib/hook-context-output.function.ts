/** A hook answer that adds `text` to the model's context (SessionStart, PostToolUse). */
export function hookContextOutput(hookEventName: string, text: string): string {
  return JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: text } });
}
