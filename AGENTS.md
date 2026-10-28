# AGENTS.md

Instructions for coding agents working in this repository. The rules and their reasons are in
[CONTRIBUTING.md](CONTRIBUTING.md) (C1–C14) and [DECISIONS.md](DECISIONS.md) (D-001 onwards). If this file disagrees
with them, they are right: fix this file in the same change. Nested `AGENTS.md` files hold the review rules for their
directory.

<role>
You are changing imagery-date, a published npm library and CLI that reports when the map imagery at a location was
captured. People act on these dates, so a wrong or over-precise date is worse than no date.

Write code only in the patterns already in this repository: its layers, file names, role suffixes, test style and
wording. Add no new folders, naming schemes, dependencies, abstractions or tools unless the task asks for them.

Reference implementations (read the nearest one before writing code of the same kind):

| Kind of change                   | Reference                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Provider, one request            | `packages/imagery-date/src/infrastructure/providers/swisstopo/`                 |
| Provider, several captures       | `packages/imagery-date/src/infrastructure/providers/ign-france/`                |
| Provider, many requests, partial | `packages/imagery-date/src/infrastructure/providers/esri-wayback/`              |
| HTTP decorator                   | `packages/imagery-date/src/infrastructure/http/retrying-http-client.adapter.ts` |
| Value object                     | `packages/imagery-date/src/domain/capture/capture-date.value-object.ts`         |
| CLI command                      | `packages/imagery-date/src/interface/cli/commands/run-history.function.ts`      |
| Recorded provider test           | `packages/imagery-date/test/providers/national-surveys.spec.ts`                 |
| Unit test next to the code       | `packages/imagery-date/src/infrastructure/http/keyed-semaphore.service.spec.ts` |
| Repository script                | `scripts/check-one-export.ts` with `scripts/one-export/`                        |

</role>

<conventions>
REQUIRED: hard rule · FORBIDDEN: absolute prohibition · PREFERRED: soft bias
</conventions>

<commands>

| Command                                     | Use                                    | Time    | Network          |
| ------------------------------------------- | -------------------------------------- | ------- | ---------------- |
| `pnpm install --frozen-lockfile`            | once per checkout                      | seconds | npm registry     |
| `pnpm test`                                 | inner loop: unit + recorded tests      | ~2 s    | none             |
| `pnpm exec vitest run <file>`               | one spec file                          | ~1 s    | none             |
| `pnpm typecheck`                            | all packages and scripts               | ~3 s    | none             |
| `pnpm exec eslint --max-warnings 0 <files>` | lint the files you changed             | ~4 s    | none             |
| `pnpm format`                               | Prettier, writes files                 | ~2 s    | none             |
| `pnpm verify`                               | every CI gate; the definition of done  | ~35 s   | none             |
| `pnpm test:live`                            | keyless providers against live servers | minutes | provider servers |
| `pnpm record`                               | re-record provider responses           | minutes | provider servers |
| `pnpm demo`                                 | demo page on http://localhost:5173     | server  | map tiles        |

- REQUIRED: Use pnpm. FORBIDDEN: `npm install`, `yarn`, adding a lockfile other than `pnpm-lock.yaml`.
- REQUIRED: Node 22 (`.nvmrc`). The published package supports Node 20.10+; do not use APIs newer than Node 20 in
  `packages/imagery-date/src`.
- FORBIDDEN: `pnpm record` and `pnpm test:live` unless the task asks for them: they call third-party servers, and
  `pnpm record` with `IMAGERY_DATE_GOOGLE_KEY` set is billed by Google.

</commands>

<agent-workflow>

1. Read the files you will change, the reference implementation for that kind of change, and the decision records
   it cites.
2. Write the change and its tests together. A behaviour change without a test is not finished.
3. Inner loop: `pnpm exec vitest run <spec>`, `pnpm typecheck`, `pnpm exec eslint --max-warnings 0 <changed files>`.
4. Before finishing, have the change checked by the custom agent for its area (Codex: spawn it; other agents: apply
   its instructions in `.codex/agents/` yourself), and fix what it finds:
   - `provider_auditor` for changes under `packages/imagery-date/src/infrastructure/providers/` or
     `packages/imagery-date/test/recordings/`;
   - `api_compat_checker` for changes to `src/index.ts`, `src/testing/`, `src/composition/`, `src/domain/` or
     `src/interface/cli/`.
5. `pnpm format`, then `pnpm verify`. The task is finished only when `pnpm verify` passes; report its result.
6. On a failing gate: fix the code, not the gate. The fix for each rule is in the `fix-verify-failure` skill.

- FORBIDDEN: Disabling, weakening or working around a rule: `eslint-disable`, `@ts-ignore`, `@ts-expect-error`,
  `as` casts, `!`, editing `eslint.config.mjs`, `.dependency-cruiser.cjs`, `tsconfig*.json`, coverage thresholds or
  the one-export checker. If a rule blocks correct code, stop and say so; the maintainer records the case in
  `DECISIONS.md`.
- FORBIDDEN: Ending a task with `pnpm verify` red without saying which gate fails and why.

</agent-workflow>

<rules>

Enforced by the toolchain; numbers refer to CONTRIBUTING.md.

- REQUIRED (C1): One exported symbol per file, named after the file in kebab-case with a role suffix. The only barrels
  are `src/index.ts` and `src/testing/index.ts`; a new public symbol is exported from `src/index.ts`.
- REQUIRED (C2): At most 150 lines per file and 40 per function (blank lines and comments excluded), 5 parameters,
  complexity 10, nesting depth 3. Specs too: split a long `describe` into several files.
- REQUIRED (C3): String and number literals only in `.enum.ts`, `.constants.ts`, `.copy.ts`, `.spec.ts` and
  `.fixture.ts`. Elsewhere only `0`, `1`, `-1`, `''` and import paths. This includes literals in types
  (`Omit<T, 'x'>`, `T['x']`) and comparisons (`typeof x === 'number'`): name them in a constants file or a schema.
- REQUIRED (C4): Enumerations are `Object.freeze({ … } as const)` in a `.enum.ts`, with the value type in its own
  `.type.ts`. FORBIDDEN: the TypeScript `enum` keyword.
- REQUIRED (C5): `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `erasableSyntaxOnly`. Untrusted
  JSON (provider responses, hook input) is parsed with a `zod/mini` schema. FORBIDDEN: `any`, `as` (except
  `as const`), `!`, constructor parameter properties, namespaces.
- REQUIRED (C6, C7): Layers point inwards: `domain` imports only `domain`; `application` imports `domain`;
  `infrastructure` imports both and Zod; `composition` wires them. A provider never imports another provider; shared
  ArcGIS code lives in `providers/arcgis/`.
- REQUIRED (C8): Only `src/interface/cli/` may import Node built-ins. The demo imports the library only through
  `imagery-date`, like any user.
- REQUIRED (C9, C10): Time, randomness and I/O only through their ports: `new Date()`, `Date.now()`, `setTimeout`,
  `Math.random()`, `fetch`, `process.env` and `console` are allowed only in their single designated files.
- REQUIRED (C13): Statuses, formats and command handlers are typed lookup tables (`Record<Enum, Value>` in a
  `.map.ts`), not `switch` or `if` chains.
- REQUIRED: Explicit `.ts` extensions in relative imports. Static-only classes are functions.
- REQUIRED: Full names: `latitude`, `response`, `milliseconds`. Abbreviations only where a provider's field is named
  so (`date_vol`, `SRC_DATE`).

</rules>

<file-names>

`<symbol-in-kebab-case>.<role>.ts`: `capture-date.value-object.ts` exports `CaptureDate`.

| Suffix             | Holds                          | Suffix          | Holds                       |
| ------------------ | ------------------------------ | --------------- | --------------------------- |
| `.value-object.ts` | immutable value, invariants    | `.interface.ts` | one interface               |
| `.enum.ts`         | one frozen `as const` object   | `.type.ts`      | one type alias              |
| `.error.ts`        | one error class                | `.port.ts`      | one abstract port           |
| `.provider.ts`     | one provider adapter           | `.adapter.ts`   | one adapter of another port |
| `.service.ts`      | one class with behaviour       | `.function.ts`  | one function                |
| `.schema.ts`       | one Zod schema                 | `.map.ts`       | one typed lookup table      |
| `.constants.ts`    | named constants for one topic  | `.copy.ts`      | text people read            |
| `.config.ts`       | values read from `process.env` | `.fake.ts`      | one deterministic fake      |
| `.fixture.ts`      | one test fixture builder       | `.spec.ts`      | tests                       |

</file-names>

<provider-data>

- REQUIRED (C11): A capture keeps the provider's precision: day, month, year or range. A field the provider does not
  state is `null`. FORBIDDEN: estimating, rounding, defaulting or inferring a date, resolution or zoom range.
- REQUIRED: The year in a copyright or attribution line is not a capture date (D-012).
- REQUIRED (C12): A provider failure is its own `failed` outcome with a `FailureCode`; a partial answer is `partial`
  and keeps what was found. Only refused input (`ImageryDateError`) rejects a lookup.
- REQUIRED: `newest` counts only captures shown at the requested zoom and never Wayback history (D-011).
- REQUIRED: Ask providers only for the fields used (`PROPERTYNAME`, `fields=`), as IGN and Google Solar do (D-013).
- FORBIDDEN: Google Earth's internal formats, Google Maps tiles, Apple Maps, HTML scraping, or any source whose terms
  forbid this use. A new provider gets a terms class and a PROVIDERS.md entry (D-007); see the `add-provider` skill.
- FORBIDDEN: A billable provider in the defaults. `google-solar` runs only when named.

</provider-data>

<recordings>

- REQUIRED: Provider tests replay responses recorded from the real services (`packages/imagery-date/test/recordings/`).
  Error answers (timeouts, 5xx, malformed bodies) are written in the spec with `scriptedExchange`.
- FORBIDDEN: Editing a recording by hand. Re-record with `pnpm record`, only when asked (the `record-provider` skill).
- REQUIRED: After recording, check that no URL in the diff contains a key or token; the recorder strips `key` and
  `token` (D-014).
- FORBIDDEN: Network in unit or recorded tests. `RecordedHttpClient` throws `UnrecordedRequestError` for any request
  that was not recorded: add the recording, do not catch the error.
- FORBIDDEN: Sleeping in tests. Use `FixedClock` and `SequenceRandom` from `imagery-date/testing`.

</recordings>

<secrets>

- FORBIDDEN: Printing, logging, committing or putting in a command line the value of `IMAGERY_DATE_GOOGLE_KEY`,
  `NPM_TOKEN` or any other key. Refer to them by name.
- FORBIDDEN: Reading `.env` files.

</secrets>

<text>

- REQUIRED: README.md, PROVIDERS.md, CHANGELOG.md, CLI output and error messages are plain reference text: what it
  does, inputs, outputs, limits, with numbers and dates. FORBIDDEN: taglines, slogans, rhetorical questions,
  marketing adjectives, emoji.
- REQUIRED: When behaviour visible to users changes, update README.md and PROVIDERS.md in the same change and add a
  line under the unreleased version in CHANGELOG.md.
- REQUIRED: Text people read lives in `.copy.ts` files.

</text>

<git>

- REQUIRED: Small commits that each pass `pnpm verify`. Subject: imperative, under 72 characters, says what changes
  for the user of the library (`Return partial outcomes when a Wayback release times out`).
- FORBIDDEN: AI or tool attribution in commits, pull requests, release notes or code: no `Co-Authored-By` lines for
  agents, no "Generated with" footers. Commits are authored by the maintainer.
- FORBIDDEN: `git push --force`, `git commit --no-verify`, rewriting published history, `git tag`, `npm publish`,
  `gh release`. Releases are cut by the maintainer (CONTRIBUTING.md, Releasing); the `prepare-release` skill stops
  before the tag.

</git>

<decisions>

- REQUIRED: When the task leaves something undecided, take the simpler option and say so in your report. Do not
  contradict a decision in DECISIONS.md; if one looks wrong, say which and why.

</decisions>

## Code Review Rules

Repository-wide; `packages/imagery-date/src/infrastructure/providers/AGENTS.md`,
`packages/imagery-date/test/AGENTS.md` and `apps/demo/AGENTS.md` add the rules for their files. Formatting, naming,
types and layers are checked by `pnpm verify`; do not comment on them.

### Public API

- Flag a removed or renamed export of `src/index.ts` or `imagery-date/testing`, report field, provider ID, status
  value, failure code, CLI option, CSV column or exit code, a narrowed type or a changed default, when CHANGELOG.md
  does not list it as breaking. Safe path: a CHANGELOG entry under the next minor version (0.x), or keep the old
  name working.

### Secrets

- Flag a key, token or credential in a recording, a fixture, a log line, an error message or a URL the CLI prints.
  Safe path: refer to the environment variable by name; the recorder strips `key` and `token` from URLs.

### Gates

- Flag any change that loosens a gate: an `eslint-disable` or `@ts-*` comment, a type assertion, an edit that relaxes
  `eslint.config.mjs`, `.dependency-cruiser.cjs`, `tsconfig*.json`, the coverage thresholds in `vitest.config.ts` or
  `scripts/one-export/`. Safe path: change the code; a rule that blocks correct code is recorded in DECISIONS.md by
  the maintainer.

### Agent setup

- Flag a change under `.codex/` that adds an `allow` rule, adds a network domain that is not a provider host in
  `test/recordings/`, removes an environment filter, or makes a hook run repository code, a package or a gate. Safe
  path: gates run inside the sandbox, started by the agent; hooks read git state and files only; wider network
  access goes only into the `imagery-date-record` profile.

## Codex

The repository is set up for Codex 0.165 or later. `pnpm check:codex` (CI: `.github/workflows/codex.yml`, with the
Codex version it pins) loads the whole setup in Codex: strict config, rule decisions, the model input with these
instructions, the skills and the custom agents, the tests inside the permission profile, and each hook on a sample
input.

| Path                   | What it does                                                                                   | Loads             |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ----------------- |
| `AGENTS.md` (+ nested) | these instructions; `## Code Review Rules` for Codex code review                               | always            |
| `.agents/skills/`      | `fix-verify-failure`, `add-provider`, `record-provider`, `prepare-release` (explicit `$` only) | always            |
| `.codex/config.toml`   | permission profiles, network proxy, environment filters, subagent limit                        | trusted project   |
| `.codex/rules/`        | `prompt` or `forbidden` for live calls, releases, force pushes, other package managers         | trusted project   |
| `.codex/hooks.json`    | SessionStart: Node and install check · Stop: no unverified changes at the end of a turn        | trusted, `/hooks` |
| `.codex/agents/`       | `provider_auditor`, `api_compat_checker`: read-only checks for agent-workflow step 4           | trusted project   |

- Trust the project when Codex asks (or add `[projects."<path>"] trust_level = "trusted"` to `~/.codex/config.toml`),
  then review and trust the two hooks once in `/hooks`. Codex skips a hook whose definition changed until it is
  trusted again.
- Default permissions (`imagery-date`): writes inside the checkout only (`.git`, `.codex`, `.agents` stay
  read-only), no `.env` files, no network. The local test servers work because `vitest.config.ts` sends loopback
  requests around the sandbox proxy. For `pnpm test:live` or a keyless `pnpm record`, switch with
  `/permissions imagery-date-record`, which reaches only the provider hosts.
- `IMAGERY_DATE_GOOGLE_KEY` and tokens are removed from every command Codex runs. Google recordings are made by the
  maintainer.
- Hooks run outside the sandbox, so they live in `.codex/hooks/` (read-only to the agent), import only Node built-ins
  (dependency rule `codex-hooks-stand-alone`) and run no repository code. The SessionStart hook remembers the tree
  as the session found it; `pnpm verify` records the tree it passed; if the session changed the tree since and it
  has not passed, the Stop hook makes Codex continue once to run `pnpm verify`, then only warns. This is a guardrail
  against forgetting the gates, not a security boundary.
- Review before pushing: `codex review --uncommitted` or `codex review --base main` uses the Code Review Rules above.
- Codex Cloud: install with `corepack enable && pnpm install --frozen-lockfile` (Node 22); the gates need no network.
