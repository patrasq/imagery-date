import type { LookupOptions } from './lookup-options.interface.ts';

export interface BatchOptions extends LookupOptions {
  /** Points looked up at once. Default 8. Memory stays bounded by it, whatever the number of points. */
  readonly concurrency?: number;
}
