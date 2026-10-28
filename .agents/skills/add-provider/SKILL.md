---
name: add-provider
description: Add a new imagery capture-date provider (a new source of capture dates) to imagery-date, from checking its terms to recorded tests and PROVIDERS.md. Not for fixing an existing provider.
---

# Add a provider

A provider reads capture dates from one documented source and maps them to `Capture` values without estimating
anything (AGENTS.md, provider-data). Before writing code, confirm with the user:

1. The source's terms allow this use, and which terms class it gets: `open-licence`, `official-api-own-key` or
   `public-terms-unclear` (DECISIONS.md D-007). Sources listed under "Not supported" in PROVIDERS.md stay out.
2. Whether it needs a key (`CredentialKind`) and whether it is billed. A billed provider has `billable: true` and is
   never enabled by default.
3. A public landmark inside its coverage for the recording.

## Files

Copy the structure of the closest existing provider (AGENTS.md, role, reference implementations). For a provider
with id `<id>`, under `packages/imagery-date/src/infrastructure/providers/<id>/`:

| File                             | Holds                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `<id>.constants.ts`              | URLs, query parameters, field names, units and the `ProviderDescriptor` (`satisfies`)        |
| `<id>-<response>.schema.ts`      | one `zod/mini` schema per response shape; only the fields used                               |
| `to-<id>-capture(s).function.ts` | maps a parsed response to `Capture` values; `null` for every field the source does not state |
| `<id>.copy.ts`                   | notes and failure details people read (only if needed)                                       |
| `<id>.provider.ts`               | `class <Name>Provider extends ImageryDateProvider`: builds the request, reads JSON, maps     |

Then:

- Add the id to `src/domain/provider/provider-id.enum.ts`, in report order (national surveys, global basemaps,
  archive, Google).
- Add the provider to `src/composition/default-provider-registry.function.ts` in the same order.
- Add a recording case to `packages/imagery-date/scripts/recording.constants.ts`.
- Ask the source only for the fields used (D-013). Prefer `HEAD` or a field mask when the source offers one.

## Tests and records

1. Record: ask the user to run, or with their approval run, `IMAGERY_DATE_RECORD_ONLY=<id> pnpm record`
   (see the `record-provider` skill).
2. Add `packages/imagery-date/test/providers/<id>.spec.ts` (or extend the matching spec) on the recording: the
   dates and their precision, product, resolution and zoom range exactly as the source states them.
3. Add scripted error answers: HTTP error, malformed body, empty result, outside coverage.
4. Add a row to the provider table in README.md and a section to PROVIDERS.md: date, source (endpoint, layer,
   fields), coverage, terms class with attribution, and the tested landmark with its result. Add a CHANGELOG line.

Done when `pnpm verify` passes and `imagery-date <lat> <lon> --providers <id>` prints the recorded date.
