// Rule C1 (CONTRIBUTING.md): every module exports exactly one symbol, named after its file. Run with `pnpm check:one-export`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exportedNames } from './one-export/exported-names.function.ts';
import { findViolation } from './one-export/find-violation.function.ts';
import { listSourceFiles } from './one-export/list-source-files.function.ts';
import { ONE_EXPORT_MESSAGES as M } from './one-export/one-export-messages.constants.ts';

const root = process.cwd();
const files = listSourceFiles(root);
const violations = files.flatMap((file) => {
  const violation = findViolation(file, exportedNames(file, readFileSync(join(root, file), M.encoding)));
  return violation ? [violation] : [];
});

for (const violation of violations) process.stderr.write(M.line(violation.file, violation.reason));
if (violations.length > 0) {
  process.stderr.write(M.summary(violations.length));
  process.exitCode = 1;
} else {
  process.stdout.write(M.ok(files.length));
}
