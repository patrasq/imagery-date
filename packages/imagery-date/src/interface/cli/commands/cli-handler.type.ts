import type { CliArguments } from '../cli-arguments.interface.ts';
import type { CliContext } from '../cli-context.interface.ts';

/** Runs one command and resolves with the process exit code. */
export type CliHandler = (parsed: CliArguments, context: CliContext) => Promise<number>;
