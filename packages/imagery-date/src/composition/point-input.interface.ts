/** One point of a batch. `key` comes back with its report (a row number, an ID). */
export interface PointInput {
  readonly key: string;
  readonly latitude: number;
  readonly longitude: number;
  /** Overrides the batch zoom for this point. */
  readonly zoom?: number;
}
