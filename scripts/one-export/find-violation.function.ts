import { kebabCase } from './kebab-case.function.ts';
import { ONE_EXPORT_MESSAGES as M } from './one-export-messages.constants.ts';
import { ONE_EXPORT_RULES as R } from './one-export-rules.constants.ts';
import type { Violation } from './violation.interface.ts';

interface FileName {
  readonly base: string;
  readonly role: string;
}

function splitFileName(path: string): FileName {
  const fileName = path.slice(path.lastIndexOf(M.pathSeparator) + 1, -R.extension.length);
  const roleStart = fileName.indexOf(M.separator);
  return roleStart < 0
    ? { base: fileName, role: '' }
    : { base: fileName.slice(0, roleStart), role: fileName.slice(roleStart + 1) };
}

function nameMatches(name: string, base: string): boolean {
  const kebab = kebabCase(name);
  if (kebab === base) return true;
  const prefix = base + M.wordSeparator;
  return kebab.startsWith(prefix) && R.roleWords.has(kebab.slice(prefix.length));
}

function singleExportReason(path: string, name: string): string | null {
  const { base, role } = splitFileName(path);
  if (!R.roleSuffixes.has(role)) return M.unknownRole(role);
  return nameMatches(name, base) ? null : M.nameMismatch(name, base);
}

function reasonFor(path: string, names: readonly string[]): string | null {
  if (R.entryPaths.some((pattern) => pattern.test(path)) || R.barrels.has(path)) return null;
  if (path.endsWith(R.testSuffix)) return names.length === 0 ? null : M.testExports;
  const [only, ...rest] = names;
  if (only === undefined) return M.noExport;
  if (rest.length > 0) return M.manyExports(names);
  return singleExportReason(path, only);
}

/** Rule C1 for one file: exactly one export, named after the file, with a known role suffix. */
export function findViolation(path: string, names: readonly string[]): Violation | null {
  const reason = reasonFor(path, names);
  return reason === null ? null : { file: path, reason };
}
