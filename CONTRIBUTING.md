# Contributing

Engineering standards for everyone who writes code here. Read this file and [DECISIONS.md](DECISIONS.md) before your
first change.

## Commands

```sh
pnpm install          # Node 22, pnpm 12
pnpm verify           # everything CI runs: types, lint, format, one-export, layer rules, tests + coverage, build
pnpm test             # unit and recorded tests: no network, seconds
pnpm test:live        # the keyless providers against the real services
pnpm record           # re-record provider responses (IMAGERY_DATE_GOOGLE_KEY=… for the Google ones)
pnpm demo             # the demo page on http://localhost:5173
```

A change is finished only when `pnpm verify` passes.

## The rules

Every rule is enforced by the toolchain. Never disable or weaken a rule, inline or in config; if a rule blocks
correct code, stop and record the case in `DECISIONS.md`.

| #   | Rule                                                                                                                                                                                                                                      | Enforced by              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| C1  | **One file, one exported symbol**, named after the file in kebab-case with a role suffix (see [File names](#file-names)). The package's two entry points (`src/index.ts`, `src/testing/index.ts`) are the only barrels.                   | `pnpm check:one-export`  |
| C2  | **Small units.** 150 lines per file, 40 per function (blank lines and comments excluded), 5 parameters, complexity 10, nesting 3. Tests too.                                                                                              | ESLint                   |
| C3  | **No magic values.** String and number literals live only in `.enum.ts`, `.constants.ts`, `.copy.ts`, `.spec.ts` and `.fixture.ts`. Allowed elsewhere: `0`, `1`, `-1`, `''`, import paths.                                                | ESLint                   |
| C4  | **Enums are frozen `as const` objects** (`Object.freeze({ … } as const)`), never TypeScript `enum`; the value type lives in its own `.type.ts`.                                                                                           | ESLint                   |
| C5  | **Strict typing.** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `erasableSyntaxOnly`. No `any`, no `as` (except `as const`), no `!`, no `@ts-ignore`. Untrusted data (every provider response) is parsed with Zod. | `tsconfig.json`, ESLint  |
| C6  | **Ports at every boundary.** The network, the clock, randomness and each provider are abstract classes in `application/ports`; adapters live in `infrastructure`; every port has a deterministic fake in `src/testing`.                   | dependency-cruiser       |
| C7  | **Layers point inwards.** `domain` imports only `domain`. `application` imports `domain` and itself. `infrastructure` imports both and Zod. A provider never imports another provider (shared ArcGIS code lives in `providers/arcgis`).   | dependency-cruiser       |
| C8  | **Runtime-agnostic core.** Only the CLI may import Node built-ins; the demo imports the library only through its public entry point, like any user.                                                                                       | dependency-cruiser       |
| C9  | **Time and randomness come from their ports.** No `new Date()`, `Date.now()`, `setTimeout` or `Math.random()` outside `SystemClock` and `SystemRandom`; tests never sleep.                                                                | ESLint                   |
| C10 | **I/O only through adapters.** `fetch` only in `FetchHttpClient`; `process.env` only in a `.config.ts`; no `console`.                                                                                                                     | ESLint                   |
| C11 | **Provider values only.** A capture date keeps the provider's precision (day, month, year, range); a field the provider does not state is `null`; no value is estimated.                                                                  | types, recorded tests    |
| C12 | **Isolated provider failures.** A provider that fails becomes its own `failed` outcome with a `FailureCode`; a partial answer keeps what was found. Refused input (`ImageryDateError`) is the only rejection.                             | tests                    |
| C13 | **Data structures over branching.** Statuses, formats and command handlers are typed lookup tables (`Record<Enum, Value>`), so the compiler proves every case is covered.                                                                 | complexity limit, review |
| C14 | **Tests ship with the code.** Domain and application 95%+ of lines, overall 85%. Provider adapters are tested on responses recorded from the real services, plus hand-written error answers.                                              | Vitest thresholds        |

No names are abbreviated (`latitude`, not `lat`; `response`, not `res`), except where a provider's field is named so.

## Architecture

```
interface/cli ─┐                  composition (createImageryDateClient, the HTTP stack, the provider registry)
apps/demo ─────┤ public API ──►        │
               │                       ▼
               │       application: LookupImageryDates → selectProviders → settleProvider (fail-open)
               │                       │ uses ports only: HttpClient, Clock, RandomSource, ImageryDateProvider
               │                       ▼
               │       domain: GeoPoint, ZoomLevel, TileCoordinate, CalendarDay, CaptureDate, outcomes
               │
infrastructure: FetchHttpClient ← Throttled (4 per host) ← Retrying (jitter, Retry-After) ← Caching (shared, LRU)
                providers/<id>: one folder per provider, each a schema, constants, a mapper and the adapter
```

A request goes cache → retry → per-host limit → fetch: repeats are answered before they take a slot, and a request
waiting out its backoff holds no slot.

## Layout

```
packages/imagery-date/
  src/domain/          calendar/ capture/ geo/ outcome/ provider/ time/ errors/
  src/application/     ports/ lookup/ batch/ errors/
  src/infrastructure/  http/ clock/ random/ providers/<provider>/
  src/composition/     the public client and its options
  src/interface/cli/   the command line: arguments, commands, CSV, output
  src/testing/         published fakes (imagery-date/testing)
  src/index.ts         the public API
  test/                recorded provider tests, CLI tests, live smoke tests, recordings/
  scripts/             the recorder
apps/demo/             a demo page of the library (Vite + MapLibre); not published
scripts/               the one-export checker
```

## File names

`<symbol-in-kebab-case>.<role>.ts`: `capture-date.value-object.ts` exports `CaptureDate`; `ign-france.provider.ts`
exports `IgnFranceProvider`; `bing.constants.ts` exports `BING`.

| Suffix             | Holds                              | Suffix          | Holds                            |
| ------------------ | ---------------------------------- | --------------- | -------------------------------- |
| `.value-object.ts` | an immutable value with invariants | `.interface.ts` | one interface                    |
| `.enum.ts`         | one frozen `as const` object       | `.type.ts`      | one type alias                   |
| `.error.ts`        | one error class                    | `.port.ts`      | one abstract port                |
| `.provider.ts`     | one provider adapter               | `.adapter.ts`   | one adapter of another port      |
| `.service.ts`      | one class with behaviour           | `.function.ts`  | one function                     |
| `.schema.ts`       | one Zod schema                     | `.map.ts`       | one typed lookup table           |
| `.constants.ts`    | named constants for one topic      | `.copy.ts`      | text people read, for one topic  |
| `.config.ts`       | values read from the environment   | `.fake.ts`      | one deterministic fake of a port |
| `.fixture.ts`      | one test fixture builder           | `.spec.ts`      | tests                            |

## Adding a provider

1. Record it first: add a landmark to `scripts/recording.constants.ts`, write the adapter, run `pnpm record`.
2. Add `providers/<id>/` with its `.constants.ts` (URLs, parameters, the descriptor), `.schema.ts` for every response
   shape, the mapping function and the `.provider.ts`; add the ID to `ProviderId` and the provider to
   `defaultProviderRegistry`.
3. Test it on the recording and on hand-written error answers; document it in [PROVIDERS.md](PROVIDERS.md) with its
   terms class and how it was checked.

## Working protocol

- Small commits that each pass `pnpm verify`.
- When something is undecided, take the simpler option and record it in `DECISIONS.md` (question, choice, reason).
- Never weaken a rule, never edit a recording by hand (re-record), never commit a key: recordings strip `key` and
  `token` from every URL.
