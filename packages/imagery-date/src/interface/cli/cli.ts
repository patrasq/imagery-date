#!/usr/bin/env node
// The `imagery-date` command: wires the process (arguments, streams, environment) to runCli.
import { createReadStream } from 'node:fs';
import { createRequire } from 'node:module';
import { createImageryDateClient } from '../../composition/create-imagery-date-client.function.ts';
import { CLI } from './cli.constants.ts';
import { CLI_CONFIG } from './cli.config.ts';
import type { CliIo } from './cli-io.interface.ts';
import { packageJsonSchema } from './package-json.schema.ts';
import { runCli } from './run-cli.function.ts';

const packageJson = packageJsonSchema.safeParse(createRequire(import.meta.url)(CLI.packageJsonPath));
const version = packageJson.success ? packageJson.data.version : CLI.empty;

const io: CliIo = {
  write: (text) =>
    new Promise((resolve) => {
      if (process.stdout.write(text)) resolve();
      else process.stdout.once(CLI.drainEvent, resolve);
    }),
  warn: (text) => {
    process.stderr.write(text);
  },
  read: (path) =>
    path === CLI.stdinPath
      ? process.stdin.setEncoding(CLI.encoding)
      : createReadStream(path, { encoding: CLI.encoding }),
};

const credentials = CLI_CONFIG.googleKey === null ? {} : { google: CLI_CONFIG.googleKey };
const client = createImageryDateClient({ credentials, userAgent: CLI.userAgent });
process.exitCode = await runCli(process.argv.slice(CLI.firstArgument), { client, io, version });
