export interface HistoryOptions {
  /** Web Mercator zoom 0..23. Default 19. Providers state which zooms show each photo. */
  readonly zoom?: number;
  /** Cancels every request of the lookup. */
  readonly signal?: AbortSignal;
}
