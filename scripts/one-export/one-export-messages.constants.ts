// Messages the one-export checker prints.
export const ONE_EXPORT_MESSAGES = {
  noExport: 'exports nothing; every module exports exactly one symbol (C1)',
  testExports: 'a test file must not export anything',
  manyExports: (names: readonly string[]) =>
    `exports ${String(names.length)} symbols (${names.join(', ')}); split it (C1)`,
  unknownRole: (role: string) =>
    `has no known role suffix ("${role}"); name it <symbol>.<role>.ts (CONTRIBUTING.md, File names)`,
  nameMismatch: (name: string, base: string) => `exports ${name}, which does not match the file name "${base}"`,
  line: (file: string, reason: string) => `${file}: ${reason}\n`,
  summary: (count: number) => `\n${String(count)} file(s) break rule C1.\n`,
  ok: (count: number) => `One export per file: ${String(count)} files checked.\n`,
  separator: '.',
  pathSeparator: '/',
  windowsPathSeparator: '\\',
  wordSeparator: '-',
  underscore: '_',
  kebabReplacement: '$1-$2',
  defaultExport: 'default',
  starExport: '*',
  encoding: 'utf8',
} as const;
