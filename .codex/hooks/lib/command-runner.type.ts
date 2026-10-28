import type { CommandResult } from './command-result.interface.ts';

/** Runs one command (program and arguments) to completion. Replaced by a fake in specs. */
export type CommandRunner = (command: readonly string[]) => CommandResult;
