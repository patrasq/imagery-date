import type { RecordedExchange } from './recorded-exchange.interface.ts';

/** Every exchange of one lookup against the real service, saved so tests replay it without the network. */
export interface Recording {
  /** What was looked up, for people: `Notre-Dame de Paris at zoom 19`. */
  readonly name: string;
  readonly recordedAt: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly zoom: number;
  readonly exchanges: readonly RecordedExchange[];
}
