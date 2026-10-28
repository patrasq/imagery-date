/** The only source of randomness (retry jitter), so tests stay deterministic. */
export abstract class RandomSource {
  /** A number in [0, 1). */
  abstract next(): number;
}
