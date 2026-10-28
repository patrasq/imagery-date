// dependency-cruiser enforces CONTRIBUTING.md rules C6, C7 and C8: layers point inwards, providers never import each
// other, the library core runs in any JavaScript runtime, and the demo uses only the published entry points.
/** An npm package, unanchored so it matches both node_modules/<name>/ and pnpm's .pnpm/<name>@<v>/node_modules/<name>/. */
const pkg = (name) => `node_modules/${name}/`;

const LIB = '^packages/imagery-date/src/';
/** Tests may import test tooling; the purity rules guard production code only. */
const SPEC = '[.]spec[.]ts$';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-unresolvable',
      severity: 'error',
      comment: 'Every import resolves.',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular imports hide coupling.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: 'A module nothing imports is dead code (entry points, specs and declarations excepted).',
      from: {
        orphan: true,
        pathNot: [SPEC, '[.]d[.]ts$', '(^|/)index[.]ts$', '/cli[.]ts$', '/main[.]ts$', '^scripts/', '/scripts/'],
      },
      to: {},
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'C7: the domain imports only itself: no ports, no adapters, no packages, no runtime built-ins.',
      from: { path: `${LIB}domain/`, pathNot: SPEC },
      to: { pathNot: `${LIB}domain/` },
    },
    {
      name: 'application-depends-on-ports',
      severity: 'error',
      comment: 'C6/C7: services depend on the domain and on ports, never on adapters, packages or built-ins.',
      from: { path: `${LIB}application/`, pathNot: SPEC },
      to: { pathNot: [`${LIB}(domain|application)/`] },
    },
    {
      name: 'infrastructure-stays-inside',
      severity: 'error',
      comment: 'C7: adapters implement ports; they import the domain, the application, other adapters and zod.',
      from: { path: `${LIB}infrastructure/`, pathNot: SPEC },
      to: { pathNot: [`${LIB}(domain|application|infrastructure)/`, pkg('zod')] },
    },
    {
      name: 'providers-are-independent',
      severity: 'error',
      comment: 'C7: a provider never imports another provider; shared ArcGIS REST code lives in providers/arcgis.',
      from: { path: `${LIB}infrastructure/providers/([^/]+)/` },
      to: {
        path: `${LIB}infrastructure/providers/([^/]+)/`,
        pathNot: [`${LIB}infrastructure/providers/$1/`, `${LIB}infrastructure/providers/arcgis/`],
      },
    },
    {
      name: 'library-core-runs-anywhere',
      severity: 'error',
      comment: 'C8: only the CLI may use Node built-ins; the library runs in browsers, Deno, Bun and workers.',
      from: { path: LIB, pathNot: [`${LIB}interface/cli/`, SPEC] },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'testing-uses-ports-only',
      severity: 'error',
      comment: 'C6: the published fakes implement ports with the domain alone.',
      from: { path: `${LIB}testing/`, pathNot: SPEC },
      to: { pathNot: [`${LIB}(domain|application|testing)/`] },
    },
    {
      name: 'nothing-imports-the-cli',
      severity: 'error',
      comment: 'The CLI is an outer shell; no library module may depend on it.',
      from: { path: LIB, pathNot: [`${LIB}interface/`] },
      to: { path: `${LIB}interface/` },
    },
    {
      name: 'demo-uses-the-public-api',
      severity: 'error',
      comment: 'C8: the demo imports the library only through its published entry points, like any user.',
      from: { path: '^apps/demo/src/' },
      to: { path: LIB, pathNot: [`${LIB}index[.]ts$`] },
    },
    {
      name: 'src-does-not-import-tests',
      severity: 'error',
      from: { path: LIB, pathNot: SPEC },
      to: { path: '^packages/imagery-date/test/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: ['/dist/', '/coverage/'] },
    tsPreCompilationDeps: true,
    combinedDependencies: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['source', 'import', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types'],
      extensions: ['.ts', '.js', '.mjs', '.cjs', '.json'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
