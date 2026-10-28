// The last step of `pnpm verify`: records the fingerprint of the checkout that just passed every gate, so the Codex
// Stop hook (.codex/hooks/stop.ts) knows these changes are verified. Writes nothing for a clean checkout.
import { CODEX_HOOKS as H } from '../.codex/hooks/lib/codex-hooks.constants.ts';
import type { CommandResult } from '../.codex/hooks/lib/command-result.interface.ts';
import { FingerprintFile } from '../.codex/hooks/lib/fingerprint-file.service.ts';
import { runCommand } from '../.codex/hooks/lib/run-command.function.ts';
import { treeFingerprint } from '../.codex/hooks/lib/tree-fingerprint.function.ts';

const root = runCommand(process.cwd(), H.git.root).stdout.trim();
const fingerprint = treeFingerprint(root, (command: readonly string[]): CommandResult => runCommand(root, command));
if (fingerprint !== null) new FingerprintFile(root, H.verifiedFile).remember(fingerprint);
