// Codex Stop hook (.codex/hooks.json). If this session changed the checkout and the result has not passed
// `pnpm verify`, Codex continues once with a request to run it. The hook runs no repository code: it reads git state
// and two fingerprints, so the gates themselves run where the agent runs them, inside the sandbox.
import { readFileSync } from 'node:fs';
import { CODEX_HOOKS as H } from './lib/codex-hooks.constants.ts';
import type { CommandResult } from './lib/command-result.interface.ts';
import { FingerprintFile } from './lib/fingerprint-file.service.ts';
import { jsonField } from './lib/json-field.function.ts';
import { runCommand } from './lib/run-command.function.ts';
import { stopDecision } from './lib/stop-decision.function.ts';
import { treeFingerprint } from './lib/tree-fingerprint.function.ts';

const event: unknown = JSON.parse(readFileSync(0, H.encoding));
const root = runCommand(process.cwd(), H.git.root).stdout.trim();
const run = (command: readonly string[]): CommandResult => runCommand(root, command);
const fingerprint = treeFingerprint(root, run);
const sessionStart = new FingerprintFile(root, H.sessionFile(String(jsonField(event, H.fields.sessionId))));
const verified = new FingerprintFile(root, H.verifiedFile);

const needsVerify = fingerprint !== null && !sessionStart.matches(fingerprint) && !verified.matches(fingerprint);
const output = stopDecision(needsVerify, jsonField(event, H.fields.stopHookActive) === true);
process.stdout.write(JSON.stringify(output));
