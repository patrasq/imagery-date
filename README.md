# imagery-date

**When was the map photo at this point taken?** Every imagery provider answers, side by side, exactly as precisely
as it publishes the date: a day, a month, a year, or a range of days. Nothing is guessed.

```
$ npx imagery-date 48.853 2.3499
48.853, 2.3499 · zoom 19 · asked 2026-10-28T14:06:49.747Z
Newest photo shown at this zoom: 2025-03-25 (Esri World Imagery)

Provider              Status            Taken                  Product         Pixel  Zoom   Distance  Published  Note
IGN France BD ORTHO   found             2024-08-27             BD ORTHO 2024   0.2 m
swisstopo SWISSIMAGE  outside-coverage                                                                            outside its coverage
Esri World Imagery    found             2025-03-25             Vivid Advanced  0.5 m  12–19
Bing Maps Aerial      found             2021-06-16/2021-10-08                         19
Google Street View    skipped                                                                                     Google Street View needs a Google Maps Platform API key; none was given, so it was not called.

A capture date is when the photo was taken, not proof the place still looks like that.
```

Basemaps do not show when their photos were taken, and the "© 2026" on them is the copyright year, not the capture
date. The dates exist, but scattered across providers' metadata services, tile headers and archives. `imagery-date`
reads them all through one library, one command line and one web page.

## Providers

| Provider                     | States the date as     | Where                       | Key                   |
| ---------------------------- | ---------------------- | --------------------------- | --------------------- |
| `ign-france` BD ORTHO        | flight day             | France and overseas regions | none                  |
| `swisstopo` SWISSIMAGE 10 cm | flight year            | Switzerland, Liechtenstein  | none                  |
| `esri-world-imagery`         | capture day, per zoom  | world                       | none                  |
| `bing` Aerial                | range of capture days  | world                       | none                  |
| `esri-wayback`               | every photo since 2014 | world                       | none (asked by name)  |
| `google-street-view`         | month of the panorama  | world                       | Google, free          |
| `google-solar`               | capture day            | where Solar has data        | Google, billed (name) |

Each provider's source, terms, precision and how it was checked are in [PROVIDERS.md](PROVIDERS.md). Google Earth
history, Google Maps satellite tiles and Apple are left out on purpose; the reasons are there too.

## Command line

```sh
npx imagery-date 48.853 2.3499                       # every default provider, zoom 19
npx imagery-date 55.6761 12.5683 --zoom 20 --json    # JSON report
npx imagery-date history 55.6761 12.5683 --zoom 18   # every Esri photo here since 2014
npx imagery-date batch points.csv > dates.csv        # a CSV of points, one row per photo out
npx imagery-date providers                           # every provider, its terms and key
```

Set `IMAGERY_DATE_GOOGLE_KEY` to a Google Maps Platform key to add Street View. `batch` reads a header row with
latitude and longitude columns (`lat`, `lon`, `lng` work) and optional `id` and `zoom`, streams the file, and writes
results in input order; a row it cannot read becomes a `refused` row in its place.

## Library

```ts
import { createImageryDateClient, ProviderId } from 'imagery-date';

const client = createImageryDateClient({ credentials: { google: process.env.GOOGLE_KEY } });

const report = await client.lookup(48.853, 2.3499, { zoom: 19 });
report.newest?.date.value; // '2025-03-25'
for (const outcome of report.outcomes)
  console.log(
    outcome.provider,
    outcome.status,
    outcome.captures.map((c) => c.date.value),
  );

const history = await client.history(55.6761, 12.5683, { zoom: 18 }); // Wayback, newest first

for await (const { key, report, error } of client.lookupMany(points, { concurrency: 8 })) {
  // input order; `error` is set instead of `report` for a point that was refused
}
```

Every capture date carries its precision and its first and last possible day (`start`, `end`), so dates of any
precision compare. A provider that fails becomes a `failed` outcome with a typed `FailureCode`; it never fails the
lookup. Runs in Node 20+, Deno, Bun, browsers and workers: the core uses only `fetch`. Test doubles for your own code
are published at `imagery-date/testing`.

### Built to run at scale

- **Polite by default**: at most 4 requests in flight per host, retries with full-jitter backoff that honour
  `Retry-After`, a timeout on every attempt.
- **Each distinct request is sent once**: identical requests in flight share one answer, and final answers are cached,
  so a batch of points in one tile asks once.
- **Constant memory**: `lookupMany` and `batch` stream; memory is bounded by the concurrency, not the input size.
- **Small requests**: Bing is read with `HEAD` (no photo downloaded); IGN and Google Solar ask only for the fields
  read (IGN 2.2 MB → 1.7 KB per point).
- **Partial answers are kept**: when some archived Wayback releases do not answer, the photos found are reported as
  `partial` with what is missing, instead of being thrown away.

## Web page

`pnpm web` serves a map: click a point, see every provider's date. Requests go from the browser straight to each
provider; a key never leaves it except to Google. The link holds the point (`#48.853,2.3499,19`) so a result can be
shared.

## Develop

```sh
pnpm install      # Node 22, pnpm 12
pnpm verify       # types, lint, format, one export per file, layer rules, tests with coverage, build
pnpm test:live    # the keyless providers, against the real services
pnpm record       # re-record provider responses (IMAGERY_DATE_GOOGLE_KEY for the Google ones)
```

The engineering rules, each enforced by the toolchain, are in [CONTRIBUTING.md](CONTRIBUTING.md); every choice the
code makes and why is in [DECISIONS.md](DECISIONS.md).

## Licence

MIT © Andrei-Dragoș Pătrașcu. The dates belong to their providers; credit them as [PROVIDERS.md](PROVIDERS.md) says.
