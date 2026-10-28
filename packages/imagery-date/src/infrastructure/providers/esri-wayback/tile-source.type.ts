import type { WaybackRelease } from './wayback-release.interface.ts';

/** Which release a release shows the tile from, or null when the release does not have the tile. */
export type TileSource = (release: WaybackRelease) => Promise<number | null>;
