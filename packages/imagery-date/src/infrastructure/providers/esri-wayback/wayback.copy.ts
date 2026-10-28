export const WAYBACK_COPY = Object.freeze({
  undatedRelease: (title: string) => `Wayback release without a day in its title: ${title}`,
  missingReleases: (missing: number, total: number, first: string) =>
    `${String(missing)} of ${String(total)} archived releases did not answer, so their photos are missing: ${first}`,
} as const);
