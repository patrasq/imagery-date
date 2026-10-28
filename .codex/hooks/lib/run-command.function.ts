import { spawnSync } from 'node:child_process';
import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';
import type { CommandResult } from './command-result.interface.ts';
import type { RunOptions } from './run-options.interface.ts';

/** Runs a command in `directory` to completion, without a shell, and returns its status and output. */
export function runCommand(directory: string, command: readonly string[], options: RunOptions = {}): CommandResult {
  const [program, ...parameters] = command;
  if (program === undefined) return { status: null, stdout: '', stderr: '' };
  const result = spawnSync(program, parameters, {
    cwd: directory,
    encoding: H.encoding,
    maxBuffer: H.maxOutputBytes,
    ...(options.environment === undefined ? {} : { env: options.environment }),
    ...(options.input === undefined ? {} : { input: options.input }),
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}
