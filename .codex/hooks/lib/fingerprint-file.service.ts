import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { CODEX_HOOKS as H } from './codex-hooks.constants.ts';

/** One remembered tree fingerprint under node_modules/.cache (not committed): a verified tree, or a session start. */
export class FingerprintFile {
  readonly #file: string;

  constructor(root: string, name: string) {
    this.#file = join(root, H.fingerprintDirectory, name);
  }

  matches(fingerprint: string): boolean {
    return existsSync(this.#file) && readFileSync(this.#file, H.encoding) === fingerprint;
  }

  remember(fingerprint: string): void {
    mkdirSync(dirname(this.#file), { recursive: true });
    writeFileSync(this.#file, fingerprint);
  }
}
