import { RandomSource } from '../application/ports/random-source.port.ts';
import { TESTING } from './testing.constants.ts';

/** Returns the given values in turn, starting over at the end. */
export class SequenceRandom extends RandomSource {
  readonly #values: readonly number[];
  #next = 0;

  constructor(values: readonly number[] = TESTING.defaultRandomValues) {
    super();
    this.#values = values.length > 0 ? values : TESTING.defaultRandomValues;
  }

  override next(): number {
    const value = this.#values[this.#next % this.#values.length] ?? 0;
    this.#next += 1;
    return value;
  }
}
