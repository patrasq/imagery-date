// Codex SessionStart hook (.codex/hooks.json). Remembers the checkout as the session found it, so the Stop hook asks
// for `pnpm verify` only after this session changed something. Tells the model, before it starts, if the running Node
// major differs from .nvmrc or the dependencies are not installed, since every gate would then fail.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CODEX_HOOKS as H } from './lib/codex-hooks.constants.ts';
import type { CommandResult } from './lib/command-result.interface.ts';
import { FingerprintFile } from './lib/fingerprint-file.service.ts';
import { hookContextOutput } from './lib/hook-context-output.function.ts';
import { jsonField } from './lib/json-field.function.ts';
import { runCommand } from './lib/run-command.function.ts';
import { sessionProblems } from './lib/session-problems.function.ts';
import { treeFingerprint } from './lib/tree-fingerprint.function.ts';

const event: unknown = JSON.parse(readFileSync(0, H.encoding));
const root = runCommand(process.cwd(), H.git.root).stdout.trim();
const run = (command: readonly string[]): CommandResult => runCommand(root, command);
const fingerprint = treeFingerprint(root, run);
if (fingerprint !== null) {
  new FingerprintFile(root, H.sessionFile(String(jsonField(event, H.fields.sessionId)))).remember(fingerprint);
}

const nvmrc = readFileSync(join(root, H.nvmrc), H.encoding);
const problems = sessionProblems(nvmrc, process.version, existsSync(join(root, H.installedMarker)));
if (problems.length > 0) process.stdout.write(hookContextOutput(H.sessionStartEvent, problems.join(H.newline)));
