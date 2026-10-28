import { describe, expect, it } from 'vitest';
import { jsonField } from './json-field.function.ts';
import { stopDecision } from './stop-decision.function.ts';
import { tailText } from './tail-text.function.ts';

describe(stopDecision.name, () => {
  it('lets the turn end when nothing needs verifying', () => {
    expect(stopDecision(false, false)).toEqual({});
    expect(stopDecision(false, true)).toEqual({});
  });

  it('continues the turn once with a request to run pnpm verify', () => {
    const decision = stopDecision(true, false);
    expect(decision.decision).toBe('block');
    expect(decision.reason).toContain('Run `pnpm verify`');
    expect(decision.reason).toContain('fix-verify-failure');
  });

  it('only warns after that retry, so the turn cannot loop', () => {
    expect(stopDecision(true, true)).toEqual({
      systemMessage: 'The changes in this session have not passed `pnpm verify`.',
    });
  });
});

describe(jsonField.name, () => {
  it('reads a field of parsed JSON and is undefined for anything else', () => {
    const event: unknown = JSON.parse('{"session_id":"abc","stop_hook_active":true}');
    expect(jsonField(event, 'session_id')).toBe('abc');
    expect(jsonField(event, 'stop_hook_active')).toBe(true);
    expect(jsonField(event, 'missing')).toBeUndefined();
    expect(jsonField(JSON.parse('null'), 'session_id')).toBeUndefined();
    expect(jsonField(JSON.parse('"text"'), 'length')).toBeUndefined();
  });
});

describe(tailText.name, () => {
  it('keeps the last 60 lines without colour codes or trailing blank lines', () => {
    const output = Array.from({ length: 100 }, (_, index) => `\u001b[2mline ${String(index)}\u001b[22m`).join('\n');
    const tail = tailText(`${output}\n\n`).split('\n');
    expect(tail).toHaveLength(60);
    expect(tail[0]).toBe('line 40');
    expect(tail.at(-1)).toBe('line 99');
  });

  it('keeps at most the last 6000 characters', () => {
    expect(tailText('x'.repeat(7000))).toHaveLength(6000);
  });
});
