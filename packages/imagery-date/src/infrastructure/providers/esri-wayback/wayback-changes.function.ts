import type { TileSource } from './tile-source.type.ts';
import type { WaybackRelease } from './wayback-release.interface.ts';

/**
 * The releases in which the tile's pixels changed, newest first. It asks the newest release which release drew its
 * tile, then asks the release before that one, and so on: one request per change, not one per release. A source that
 * points forward, or to an unknown release, ends the walk, so it always ends.
 */
export async function waybackChanges(
  releases: readonly WaybackRelease[],
  sourceOf: TileSource,
): Promise<WaybackRelease[]> {
  const position = new Map(releases.map((release, index) => [release.number, index]));
  const changes: WaybackRelease[] = [];
  let index = releases.length - 1;
  while (index >= 0) {
    const asked = releases[index];
    const drawnIn = asked === undefined ? null : await sourceOf(asked);
    const drawnAt = drawnIn === null ? undefined : position.get(drawnIn);
    const drawn = drawnAt === undefined || drawnAt > index ? undefined : releases[drawnAt];
    if (drawnAt === undefined || drawn === undefined) break;
    changes.push(drawn);
    index = drawnAt - 1;
  }
  return changes;
}
