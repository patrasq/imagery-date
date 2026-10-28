import type { CliCommand } from './cli-command.enum.ts';

export type CliCommandValue = (typeof CliCommand)[keyof typeof CliCommand];
