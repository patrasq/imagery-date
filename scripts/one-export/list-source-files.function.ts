import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ONE_EXPORT_MESSAGES as M } from './one-export-messages.constants.ts';
import { ONE_EXPORT_RULES as R } from './one-export-rules.constants.ts';

const listRoot = (repositoryRoot: string, root: string): string[] =>
  readdirSync(join(repositoryRoot, root), { recursive: true, encoding: M.encoding }).map((path) =>
    [root, path.replaceAll(M.windowsPathSeparator, M.pathSeparator)].join(M.pathSeparator),
  );

/** Every TypeScript source under the checked roots, as repository-relative paths with forward slashes. */
export function listSourceFiles(repositoryRoot: string): string[] {
  return R.roots
    .flatMap((root) => listRoot(repositoryRoot, root))
    .filter((path) => path.endsWith(R.extension) && !R.ignoredPaths.some((pattern) => pattern.test(path)))
    .sort();
}
