// ESLint enforces CONTRIBUTING.md rules C2 (small units), C3 (no magic values), C4 (no TS enums), C5 (strict typing),
// C9 (time and randomness only from their ports) and C10 (I/O only through its adapters). Never weaken a rule here;
// record a blocked case in DECISIONS.md.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/** Files where string and number literals may live (C3). */
const LITERAL_FILES = ['**/*.enum.ts', '**/*.constants.ts', '**/*.copy.ts', '**/*.spec.ts', '**/*.fixture.ts'];
/** The only places that may read the real time or real randomness (C9). */
const CLOCK_FILES = ['packages/imagery-date/src/infrastructure/clock/system-clock.adapter.ts'];
const RANDOM_FILES = ['packages/imagery-date/src/infrastructure/random/system-random.adapter.ts'];
/** The only place that may call the network (C10). */
const FETCH_FILES = ['packages/imagery-date/src/infrastructure/http/fetch-http-client.adapter.ts'];
/** The only places that may read the environment (C10). */
const CONFIG_FILES = ['**/*.config.ts'];

const IMPORT_SOURCE =
  ':matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration, ImportExpression, TSExternalModuleReference, TSModuleDeclaration) > Literal';

const NO_ENUM = { selector: 'TSEnumDeclaration', message: 'C4: use a frozen `as const` object in a .enum.ts file.' };
const NO_STRING_LITERAL = {
  selector: `Literal[raw=/^['"]/]:not([value='']):not(${IMPORT_SOURCE})`,
  message: 'C3: move this string into a .enum.ts, .constants.ts or .copy.ts file and reference it by name.',
};
const NO_TEMPLATE_TEXT = {
  selector: 'TemplateElement[value.raw=/\\S/]',
  message: 'C3: template text is a magic string; build it from named constants.',
};
const NO_REAL_TIME = [
  { selector: "NewExpression[callee.name='Date']", message: 'C9: read the time from the Clock port.' },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: 'C9: read the time from the Clock port.',
  },
  {
    selector: "CallExpression[callee.object.name='performance'][callee.property.name='now']",
    message: 'C9: read the time from the Clock port.',
  },
  { selector: "CallExpression[callee.name='setTimeout']", message: 'C9: wait through the Clock port.' },
];
const NO_REAL_RANDOM = {
  selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
  message: 'C9: draw randomness from the RandomSource port.',
};
const NO_FETCH = {
  selector: "CallExpression[callee.name='fetch']",
  message: 'C10: call the network only through the HttpClient port.',
};
const NO_PROCESS_ENV = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message: 'C10: read the environment only in a .config.ts file.',
};

const BASE_SYNTAX = [NO_ENUM, ...NO_REAL_TIME, NO_REAL_RANDOM, NO_FETCH, NO_PROCESS_ENV];
const without = (...removed) => BASE_SYNTAX.filter((entry) => !removed.flat().includes(entry));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'packages/imagery-date/test/recordings/**',
      '**/*.config.*',
      '.dependency-cruiser.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // C2: small units
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/max-params': ['error', { max: 5 }],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      // C3: no magic numbers (strings: no-restricted-syntax below)
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ignore: [0, 1, -1], ignoreArrayIndexes: true, ignoreTypeIndexes: true, detectObjects: true },
      ],
      // C3 + C4 + C9 + C10
      'no-restricted-syntax': ['error', ...BASE_SYNTAX, NO_STRING_LITERAL, NO_TEMPLATE_TEXT],
      // C5: strict typing
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'no-console': 'error',
      eqeqeq: 'error',
    },
  },
  {
    files: LITERAL_FILES,
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'no-restricted-syntax': ['error', ...BASE_SYNTAX],
    },
  },
  {
    files: CONFIG_FILES,
    rules: { 'no-restricted-syntax': ['error', ...without(NO_PROCESS_ENV), NO_STRING_LITERAL, NO_TEMPLATE_TEXT] },
  },
  {
    files: CLOCK_FILES,
    rules: { 'no-restricted-syntax': ['error', ...without(NO_REAL_TIME), NO_STRING_LITERAL, NO_TEMPLATE_TEXT] },
  },
  {
    files: RANDOM_FILES,
    rules: { 'no-restricted-syntax': ['error', ...without(NO_REAL_RANDOM), NO_STRING_LITERAL, NO_TEMPLATE_TEXT] },
  },
  {
    files: FETCH_FILES,
    rules: { 'no-restricted-syntax': ['error', ...without(NO_FETCH), NO_STRING_LITERAL, NO_TEMPLATE_TEXT] },
  },
  {
    // The only barrel lists the public API one export per line, so it may outgrow C2's 150 lines (DECISIONS.md D-006).
    files: ['packages/imagery-date/src/index.ts'],
    rules: { 'max-lines': 'off' },
  },
  prettier,
);
