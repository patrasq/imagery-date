import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from './command-result.interface.ts';
import { FingerprintFile } from './fingerprint-file.service.ts';
import { sessionProblems } from './session-problems.function.ts';
import { treeFingerprint } from './tree-fingerprint.function.ts';

const directories: string[] = [];
const temporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'imagery-date-codex-'));
  directories.push(directory);
  return directory;
};
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

const git =
  (status: string, diff: string, untracked: string) =>
  (command: readonly string[]): CommandResult => {
    const outputs: Record<string, string> = { status, diff, 'ls-files': untracked, 'rev-parse': 'abc123\n' };
    return { status: 0, stdout: outputs[command[1] ?? ''] ?? '', stderr: '' };
  };

describe(treeFingerprint.name, () => {
  it('is null for a clean checkout', () => {
    expect(treeFingerprint(temporaryDirectory(), git('', '', ''))).toBeNull();
  });

  it('changes with the diff and with the contents of untracked files', () => {
    const root = temporaryDirectory();
    writeFileSync(join(root, 'new.ts'), 'one');
    const first = treeFingerprint(root, git(' M a.ts\n?? new.ts\n', 'diff 1', 'new.ts\0'));
    const sameAgain = treeFingerprint(root, git(' M a.ts\n?? new.ts\n', 'diff 1', 'new.ts\0'));
    writeFileSync(join(root, 'new.ts'), 'two');
    const edited = treeFingerprint(root, git(' M a.ts\n?? new.ts\n', 'diff 1', 'new.ts\0'));
    expect(first).toBe(sameAgain);
    expect(edited).not.toBe(first);
    expect(treeFingerprint(root, git(' M a.ts\n', 'diff 2', ''))).not.toBe(first);
  });
});

describe(FingerprintFile.name, () => {
  it('remembers one fingerprint per name', () => {
    const root = temporaryDirectory();
    const verified = new FingerprintFile(root, 'verified-tree');
    expect(verified.matches('abc')).toBe(false);
    verified.remember('abc');
    expect(verified.matches('abc')).toBe(true);
    expect(verified.matches('def')).toBe(false);
    expect(new FingerprintFile(root, 'session-1').matches('abc')).toBe(false);
  });
});

describe(sessionProblems.name, () => {
  it('says nothing when the Node major matches .nvmrc and dependencies are installed', () => {
    expect(sessionProblems('22\n', 'v22.22.0', true)).toEqual([]);
  });

  it('names a different Node major and a missing install', () => {
    expect(sessionProblems('22\n', 'v24.3.0', false)).toEqual([
      'Node v24.3.0 is running; this repository uses Node 22 (.nvmrc). The gates may fail for that reason.',
      'Dependencies are not installed. Run `pnpm install --frozen-lockfile` first (it needs the npm registry).',
    ]);
  });
});
