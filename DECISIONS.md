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

## D-009 · Wayback: tilemap walk, 90 s timeout, partial outcomes

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

## D-013 · Field masks for IGN and Google Solar

IGN gets `PROPERTYNAME=date_vol,res,pva` (2.2 MB of polygons → 1.7 KB per point) and Google Solar gets
`fields=imageryDate,imageryQuality,center` (7.8 MB → 831 bytes at the Palace of the Parliament).

## D-014 · Recorded tests, with secrets stripped

Provider adapters are tested on responses recorded from the real services through the library's own HTTP stack (so
recordings hold final answers after retries), with `key` and `token` removed from every URL before it is written or
matched. Hand-written answers cover errors the real services cannot be made to give. `pnpm test:live` checks the
keyless providers still answer.

## D-015 · Defaults: zoom 19, 4 requests per host, 8 points at once

Zoom 19 is building level, where every basemap shows its finest photo almost everywhere. Four requests per host keeps
load on public services low and stays under the browser's per-host limit of six; eight points at once keeps a batch moving while each host
still sees at most four requests.

## D-016 · The CLI exits 2 for misuse, 0 otherwise

A provider failing is part of the report, not an error of the command, so the command exits 0 and prints the other
answers. Misuse (arguments, refused coordinates, a CSV without coordinate columns) exits 2 with the reason on stderr.

## D-017 · Published under the author's own account

The repository, the npm package and the page are Andrei-Dragoș Pătrașcu's. Nothing names any company's data sources.

## D-018 · npm releases from GitHub Actions, without 2FA on the account

npm refuses to publish from an account without two-factor authentication unless the token is a granular access token
with "bypass 2FA" (checked 2026-10-28). Such tokens keep direct publish access until January 2027 (GitHub changelog,
2026-07-31). The account stays without 2FA: 0.1.0 is published by `release.yml` with a short-lived bypass token in the
`NPM_TOKEN` secret, so the token never leaves npmjs.com and GitHub; trusted publishing (OIDC) is then configured for
`release.yml` on the package's npm settings, and the secret and token are deleted. Trusted publishing needs npm 11.5.1
or later, so the workflow installs npm 11.21.0. Provenance is attached to every release.

## D-019 · Codex setup: gates inside the sandbox, checked against a real Codex

The repository carries instructions and configuration for coding agents (AGENTS.md, `.agents/skills`, `.codex/`),
written for Codex 0.165 and checked against it (2026-10-28).

- Commands run under a permission profile that writes only inside the checkout, cannot read `.env` files and reaches
  no host; a second profile, chosen by hand, reaches only the hosts in `test/recordings/`. The rules file has no
  `allow` rule, because `allow` runs a command outside the sandbox and the gates execute code the agent edited.
- Keys are removed from the environment of every command Codex runs, so recording the billed Google providers stays
  with the maintainer.
- Hooks run outside the sandbox. A hook that ran the gates, ESLint or anything from `node_modules` would run code
  the agent can edit, unsandboxed; so would a hook script the agent can edit. The hooks are therefore TypeScript in
  `.codex/` (read-only to sandboxed commands), import only Node built-ins (dependency rule `codex-hooks-stand-alone`)
  and only read git state and files. The agent runs `pnpm verify` itself, in the sandbox; its last step records the
  verified tree, and the Stop hook asks for a run when the session changed the tree since. It continues a turn at
  most once, so it cannot loop. Every repository rule and test covers the hook code.
- `pnpm check:codex` (CI: `codex.yml`) loads the setup in the pinned Codex without a login: `--strict-config` with a
  provider that does not exist (config loads, then Codex stops), `codex execpolicy check` on fixed cases,
  `codex debug prompt-input` for the instructions, skills and agents, and each hook command on a sample input. A
  weekly run against the newest Codex reports format changes.
- Model, provider and profiles are not set: a project file may not set provider or profiles, and a pinned model would
  override each contributor's choice.

## D-020 · Loopback requests in tests bypass HTTP proxies

The FetchHttpClient spec talks to a local server. When the environment routes Node's `fetch` through a proxy (a
corporate proxy, or the Codex sandbox, which sets `NODE_USE_ENV_PROXY=1` and a proxy that refuses loopback), that
spec failed. `vitest.config.ts` adds `127.0.0.1` and `localhost` to `NO_PROXY` before workers start; no other request
is affected.

## D-021 · TypeScript stays on 6.x; Node types follow Node 22

TypeScript 7.0 (the Go compiler) does not ship the JavaScript compiler API. `scripts/one-export` parses files with it,
and typescript-eslint 8.72.1, the newest release, requires TypeScript below 6.1 (checked 2026-10-29). Dependabot
therefore skips TypeScript 7; the ignore rule in `.github/dependabot.yml` is removed once typescript-eslint supports 7
and the one-export check has a parser that does not need the old API. `@types/node` gets no major updates: its major
stays the Node major in `.nvmrc` and `engines`, the Node the repository is built and tested with.
