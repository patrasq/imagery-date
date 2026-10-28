/** What the command line was asked to do. A point with no command name is a lookup. */
export const CliCommand = Object.freeze({
  Lookup: 'lookup',
  History: 'history',
  Batch: 'batch',
  Providers: 'providers',
  Help: 'help',
  Version: 'version',
} as const);
