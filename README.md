# imagery-date

[![npm](https://img.shields.io/npm/v/imagery-date)](https://www.npmjs.com/package/imagery-date)
[![verify](https://github.com/patrasq/imagery-date/actions/workflows/verify.yml/badge.svg)](https://github.com/patrasq/imagery-date/actions/workflows/verify.yml)
[![license](https://img.shields.io/npm/l/imagery-date)](https://github.com/patrasq/imagery-date/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/imagery-date)](https://www.npmjs.com/package/imagery-date)

Look up the capture date of the map imagery at a location. `imagery-date` queries Esri World Imagery, Esri Wayback,
Bing Maps, IGN France (BD ORTHO), swisstopo (SWISSIMAGE) and Google (Street View, Solar API) and returns each
provider's date with its precision: day, month, year or date range.

TypeScript library and CLI. Node 20 or later; the library also runs in browsers, Deno and Bun.

## Install

```sh
npm install imagery-date      # library
npx imagery-date --help       # CLI
```

## CLI

```
$ imagery-date 48.853 2.3499
48.853, 2.3499 · zoom 19 · queried 2026-10-28T14:38:43.801Z
Newest photo shown at this zoom: 2025-03-25 (Esri World Imagery)

Provider              Status            Taken                  Product         Pixel  Zoom   Distance  Published  Note
IGN France BD ORTHO   found             2024-08-27             BD ORTHO 2024   0.2 m
swisstopo SWISSIMAGE  outside-coverage                                                                            outside its coverage
Esri World Imagery    found             2025-03-25             Vivid Advanced  0.5 m  12–19
Bing Maps Aerial      found             2021-06-16/2021-10-08                         19
Google Street View    skipped                                                                                     No Google Maps Platform API key given.
```

| Command                              | Output                                              |
| ------------------------------------ | --------------------------------------------------- |
| `imagery-date <lat> <lon>`           | dates from the default providers                    |
| `imagery-date history <lat> <lon>`   | every photo Esri World Imagery has shown since 2014 |
| `imagery-date batch <file.csv \| ->` | CSV, one row per photo, in input order              |
| `imagery-date providers`             | provider IDs, terms class, key, default             |

| Option              | Default                |                                    |
| ------------------- | ---------------------- | ---------------------------------- |
| `-z, --zoom`        | 19                     | Web Mercator zoom, 0–23            |
| `-p, --providers`   | all enabled by default | comma-separated provider IDs       |
| `-c, --concurrency` | 8                      | points looked up at once (`batch`) |
| `--json`            |                        | JSON instead of a table            |

`IMAGERY_DATE_GOOGLE_KEY` sets a Google Maps Platform key, which enables `google-street-view`. `google-solar` is
billed by Google and runs only when listed in `--providers`.

`batch` input needs a header row with latitude and longitude columns (`latitude`/`lat`/`y`, `longitude`/`lon`/`lng`/`x`)
and may have `id` and `zoom` columns. Output columns: `key, latitude, longitude, zoom, provider, status, date,
precision, start, end, product, resolution_m, zoom_min, zoom_max, distance_m, published_on, newest, failure_code,
failure_detail`. Rows with invalid coordinates are written with status `refused`.

Exit codes: `0` success (individual provider failures are reported in the output), `2` invalid arguments or input.

## Library

```ts
import { createImageryDateClient } from 'imagery-date';

const client = createImageryDateClient({ credentials: { google: process.env.GOOGLE_KEY } });

const report = await client.lookup(48.853, 2.3499, { zoom: 19 });
report.newest?.date.value; // '2025-03-25'

const history = await client.history(55.6761, 12.5683, { zoom: 18 });

for await (const result of client.lookupMany(points, { concurrency: 8 })) {
  // results arrive in input order; result.error is set instead of result.report for invalid points
}
```

`lookup` returns an `ImageryDateReport`:

| Field        | Type                |                                                           |
| ------------ | ------------------- | --------------------------------------------------------- |
| `point`      | `GeoPoint`          |                                                           |
| `zoom`       | `ZoomLevel`         |                                                           |
| `observedAt` | `string`            | ISO time of the query                                     |
| `outcomes`   | `ProviderOutcome[]` | one per provider queried                                  |
| `newest`     | `Capture \| null`   | latest capture shown at `zoom`, excluding Wayback history |

`ProviderOutcome.status` is `found`, `partial`, `no-date`, `outside-coverage`, `skipped` or `failed`; `failure` holds
a `FailureCode` (`timeout`, `network`, `aborted`, `http-status`, `invalid-response`, `refused`, `missing-credential`,
`unexpected`) and a detail. A `Capture` has `date` (`CaptureDate`: `value`, `precision`, `start`, `end`), `product`,
`resolutionMetres`, `zoomRange`, `distanceMetres`, `publishedOn` and `attribution`; fields a provider does not supply
are `null`.

Methods reject only with an `ImageryDateError` subclass for invalid input (coordinates, zoom, unknown provider ID).

Client options: `credentials`, `userAgent`, `timeoutMilliseconds` (15 000), `requestsPerHost` (4), `cacheEntries`
(5 000), and `httpClient`, `clock`, `random` to replace the defaults. Test doubles (`RecordedHttpClient`,
`FixedClock`, `SequenceRandom`) are exported from `imagery-date/testing`.

## Providers

| ID                   | Date                        | Coverage                    | Key                  | Default |
| -------------------- | --------------------------- | --------------------------- | -------------------- | ------- |
| `ign-france`         | day (flight)                | France and overseas regions | none                 | yes     |
| `swisstopo`          | year (flight)               | Switzerland, Liechtenstein  | none                 | yes     |
| `esri-world-imagery` | day, per zoom range         | world                       | none                 | yes     |
| `bing`               | date range of the tile      | world                       | none                 | yes     |
| `esri-wayback`       | day, every photo since 2014 | world                       | none                 | no      |
| `google-street-view` | month or year (panorama)    | world                       | Google Maps Platform | yes     |
| `google-solar`       | day                         | Solar API coverage          | Google Maps Platform | no      |

Sources, terms and test locations per provider: [PROVIDERS.md](PROVIDERS.md). Google Earth history, Google Maps
satellite tiles and Apple Maps are not supported (see there).

## HTTP behaviour

- At most 4 concurrent requests per host.
- 15 s timeout per attempt (90 s for Wayback metadata services); 3 attempts with full-jitter exponential backoff;
  `Retry-After` is honoured.
- Identical in-flight requests are merged; successful responses are cached (LRU, 5 000 entries).
- Bing is read with `HEAD`; IGN and Google Solar requests ask only for the fields used.
- `lookupMany` and `batch` stream; memory is bounded by the concurrency.

## Notes

- A capture date is when the photo was taken; the place may have changed since.
- The year in a basemap's copyright line is not its capture date.
- Esri and Bing metadata is read from public endpoints whose terms do not explicitly cover this use; see
  [PROVIDERS.md](PROVIDERS.md).

## Demo

[patrasq.github.io/imagery-date](https://patrasq.github.io/imagery-date/) (`apps/demo`, not part of the npm package):
a map that runs the library in the browser.

## Development

```sh
pnpm install      # Node 22, pnpm 12
pnpm verify       # typecheck, lint, format, one-export check, dependency rules, tests with coverage, build
pnpm test:live    # keyless providers against the live services
pnpm record       # re-record provider responses (IMAGERY_DATE_GOOGLE_KEY for the Google providers)
pnpm demo         # demo on http://localhost:5173
```

Rules: [CONTRIBUTING.md](CONTRIBUTING.md). Design decisions: [DECISIONS.md](DECISIONS.md). Coding agents:
[AGENTS.md](AGENTS.md).

## Working on this repo with Codex

| Path                 | What it does                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`          | Rules, commands and workflow, read at the start of every session. Its `Code Review Rules`, and those in the nested `AGENTS.md` of the providers, tests and demo, are what Codex code review checks for those files. |
| `.agents/skills/`    | Fix a failing `pnpm verify` gate, add a provider, re-record provider responses, prepare a release (runs only when named).                                                                                           |
| `.codex/config.toml` | Sandbox profiles. `imagery-date` (default): writes only inside the checkout, no `.env` reads, no outside hosts. `imagery-date-record`: the provider hosts only. Keys and tokens are removed from every command.     |
| `.codex/rules/`      | Asks before live provider calls, `git push` and destructive git commands; refuses publish, tags, releases, force pushes, `--no-verify` and npm/yarn/bun installs. No rule runs a command outside the sandbox.       |
| `.codex/hooks/`      | At session start, reports a wrong Node version or a missing install. When a turn ends with changes that have not passed `pnpm verify`, sends Codex back once to run it.                                             |
| `.codex/agents/`     | Read-only reviewers: `provider_auditor` (provider data rules) and `api_compat_checker` (public API changes since the last tag).                                                                                     |
| `pnpm check:codex`   | Loads the whole setup in Codex without a login and checks config, rule decisions, model input, sandbox profiles and hooks. CI runs it on Codex 0.165.0 and weekly on the newest release.                            |

Codex loads `.codex/` only in a trusted project: trust the project when Codex asks, then approve the two hooks in
`/hooks`.

Two lessons from setting this up:

- **Hooks run outside the sandbox.** A hook that calls a script Codex can edit, or that runs the tests, runs
  agent-written code unsandboxed. The hooks here sit in `.codex/hooks/`, which the sandbox keeps read-only, import only
  Node built-ins (a dependency-cruiser rule enforces it) and only compare git state. `pnpm verify` itself runs inside
  the sandbox.
- **GitHub's Ubuntu 24.04 runners block Codex's sandbox.** Codex reads `AGENTS.md` through bubblewrap, which needs
  unprivileged user namespaces; Ubuntu 24.04 restricts them, and Codex fails with
  `bwrap: loopback: Failed RTM_NEWADDR: Operation not permitted`. One line before Codex runs fixes it:

  ```sh
  sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0
  ```

## License

MIT
