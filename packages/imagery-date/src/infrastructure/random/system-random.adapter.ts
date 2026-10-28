import { RandomSource } from '../../application/ports/random-source.port.ts';

/** The real randomness: the only place that calls Math.random (CONTRIBUTING.md rule C9). Not for secrets. */
export class SystemRandom extends RandomSource {
  override next(): number {
    return Math.random();
  }
}
