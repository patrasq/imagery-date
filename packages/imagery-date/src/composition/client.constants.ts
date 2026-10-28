/** What a client does when the caller does not say. */
export const CLIENT = Object.freeze({
  /** Building level: the zoom at which a basemap shows its finest photo almost everywhere. */
  defaultZoom: 19,
  /** Points looked up at once by `lookupMany`; requests per host stay capped by the HTTP stack either way. */
  defaultConcurrency: 8,
} as const);
