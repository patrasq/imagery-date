import type { HistoryOptions } from './history-options.interface.ts';

export interface LookupOptions extends HistoryOptions {
  /** Provider IDs to ask (`ProviderId`); default: every provider enabled by default whose key is given. */
  readonly providers?: readonly string[];
}
