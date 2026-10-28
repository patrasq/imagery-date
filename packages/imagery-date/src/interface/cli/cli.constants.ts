/** The command line: names, options, exit codes. */
export const CLI = Object.freeze({
  name: 'imagery-date',
  commands: Object.freeze({ history: 'history', batch: 'batch', providers: 'providers' }),
  parseOptions: Object.freeze({
    zoom: { type: 'string', short: 'z' },
    providers: { type: 'string', short: 'p' },
    concurrency: { type: 'string', short: 'c' },
    json: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
  } as const),
  listSeparator: ',',
  stdinPath: '-',
  exit: Object.freeze({ ok: 0, failure: 1, usage: 2 }),
  environment: Object.freeze({ googleKey: 'IMAGERY_DATE_GOOGLE_KEY' }),
  userAgent: 'imagery-date-cli (+https://github.com/patrasq/imagery-date)',
  packageJsonPath: '../../../package.json',
  /** process.argv starts with node and the script. */
  firstArgument: 2,
  /** Taken, product, pixel, zoom, distance, published: the table cells of one photo. */
  captureCellCount: 6,
  jsonIndentation: 2,
  columnGap: '  ',
  newline: '\n',
  empty: '',
  encoding: 'utf8',
  drainEvent: 'drain',
} as const);
