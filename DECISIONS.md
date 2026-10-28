# Decisions

Choices the code makes, newest last. Each entry: the question, the option chosen, why.

## D-001 · TypeScript only

One TypeScript codebase for the library, the CLI and the demo page. The work is network-bound (each lookup waits on
1–22 requests to rate-limited services), so a faster language would not make it faster, and the page must run in a
browser. Other languages are decided later, from who actually uses it.

## D-002 · A pnpm workspace: the package and its demo apart

`packages/imagery-date` is what npm gets: the library and the CLI, the tool itself. `apps/demo` is a private demo that
uses only the package's public entry point (rule C8). The demo never ships inside the package, and it builds from the package's TypeScript through the `source`
export condition, so it never runs on a stale build.

## D-003 · TypeScript 6.0.3, not 7

typescript-eslint 8.72 supports TypeScript below 6.1, and dependency-cruiser and the one-export checker use the
compiler API, which 7 does not ship. Move to 7 when the lint toolchain does.

## D-004 · Explicit `.ts` imports, erasable syntax only

Imports name the `.ts` file and `rewriteRelativeImportExtensions` turns them into `.js` in the build;
`erasableSyntaxOnly` (no parameter properties, no `enum`) lets Node run the sources directly, so the recorder and
the checker need no build step.

## D-005 · zod/mini for response schemas

Every provider response is untrusted until it matches a schema (C5). `zod/mini` is the tree-shakable build, so the
demo page pays for the schemas it uses only; it is the package's one runtime dependency.

## D-006 · The public barrel may exceed 150 lines

`src/index.ts` lists the public API one export per line, grouped, so it may outgrow C2's limit; ESLint exempts that
file alone.

## D-007 · Which providers, and how they are classed

Included: two open national surveys (IGN, swisstopo), two public basemap metadata sources (Esri, Bing) and the Esri
archive, and two official Google APIs called with the user's own key. Left out: Google Earth history (an undocumented
format Google's terms do not allow), Google Maps tiles (no date, and direct tile access breaks the terms) and Apple
(no date source). Esri and Bing are classed `public-terms-unclear` and say so in PROVIDERS.md.

## D-008 · Bing: HEAD, a fixed generation, zoom 19

The capture range is in the tile's headers, so the tile is asked for with `HEAD` and never downloaded. The tile service
refuses a request without its `g` (generation) parameter and accepts any current value; `15000` was accepted on
2026-10-28 (a value far above the current generation is refused). Bing's aerial layer is complete to zoom 19, so a
deeper zoom is asked at 19 and the capture says so.

## D-009 · Wayback: walk the changes, wait long, keep partial answers

Asking every release (197) per point would be 400 requests. Each release's tilemap names the release that drew the
tile, so the walk asks only releases where the tile changed: 11 tilemaps and 11 metadata queries at Copenhagen City
Hall. Archived metadata services answered in 25–61 s and once with a 502 (2026-10-28), so they get a 90 s timeout,
and a release that still does not answer turns the outcome `partial` instead of discarding the photos found.

## D-010 · Fail open per provider; reject only refused input

A provider that times out, errs or changes shape becomes its own `failed` outcome with a `FailureCode`; the lookup
always answers with the others. The only rejections are `ImageryDateError`s for input the library refuses
(coordinates, zoom, an unknown provider). In a batch, even those become a result per point, so one bad row never ends
a run.

## D-011 · "Newest" is what is shown at the zoom asked about

`newest` compares only photos whose zoom range includes the zoom asked (or that state none), and never archive entries
(Wayback), which are history. At Copenhagen City Hall the newest photo at zoom 19 is 2025-03-21 and at zoom 20 the
2012 aerial, which is what the basemap shows there.

## D-012 · Google Street View: name contributed photo spheres

The metadata API cannot exclude photo spheres people upload, and near landmarks they are usually the nearest
panorama. A panorama not credited exactly `© Google` or `© <year> Google` is named "Street View photo by a
contributor", with its owner's credit. Recordings use a Google panorama and a company's, so no private person's name
is committed.

## D-013 · Ask only for the fields read

IGN gets `PROPERTYNAME=date_vol,res,pva` (2.2 MB of polygons → 1.7 KB per point) and Google Solar gets
`fields=imageryDate,imageryQuality,center` (7.8 MB → 831 bytes at the Palace of the Parliament).

## D-014 · Recorded tests, with secrets stripped

Provider adapters are tested on responses recorded from the real services through the library's own HTTP stack (so
recordings hold final answers after retries), with `key` and `token` removed from every URL before it is written or
matched. Hand-written answers cover errors the real services cannot be made to give. `pnpm test:live` checks the
keyless providers still answer.

## D-015 · Defaults: zoom 19, 4 requests per host, 8 points at once

Zoom 19 is building level, where every basemap shows its finest photo almost everywhere. Four requests per host stays
polite to public services and under the browser's six; eight points at once keeps a batch moving while each host
still sees at most four requests.

## D-016 · The CLI exits 2 for misuse, 0 otherwise

A provider failing is part of the report, not an error of the command, so the command exits 0 and prints the other
answers. Misuse (arguments, refused coordinates, a CSV without coordinate columns) exits 2 with the reason on stderr.

## D-017 · Published under the author's own account

The repository, the npm package and the page are Andrei-Dragoș Pătrașcu's. Nothing names any company's data sources.
