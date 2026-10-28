---
name: fix-verify-failure
description: Fix a failing `pnpm verify` gate in imagery-date (typecheck, ESLint C1–C14 rules, Prettier, one-export check, dependency-cruiser layers, coverage, build) the way this repository fixes it, without weakening the rule.
---

# Fix a failing gate

`pnpm verify` runs, in order: `typecheck`, `lint`, `format:check`, `check:one-export`, `check:deps`, `test:coverage`,
`build`. It stops at the first failure. Fix the code; never the rule (AGENTS.md, agent-workflow).

Run the failing gate alone while fixing it, then `pnpm verify` once at the end.

## ESLint

The message names the rule. Fixes used in this repository:

| Message or rule                                  | Fix                                                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `C3: move this string into …`                    | Add the value to the topic's `<topic>.constants.ts` (frozen object, e.g. `SWISSTOPO.productName`) or `.copy.ts` (text people read) and reference it by name. |
| `C3` on a literal inside a type (`Omit<T, 'x'>`) | Declare the shape as its own `.interface.ts` or derive it from a Zod schema (`z.infer`); do not index types with string literals.                            |
| `C3` on `typeof x === 'number'`                  | Parse with a `zod/mini` schema, or use `Number.isInteger` / `Number.isFinite`.                                                                               |
| `C3: template text is a magic string`            | Build the text in a `.copy.ts` function (`LOOKUP_COPY.missingCredential(credential)`).                                                                       |
| `@typescript-eslint/no-magic-numbers`            | Name the number in the topic's `.constants.ts` (`extentHalfSideDegrees: 0.01`).                                                                              |
| `max-lines-per-function` (40)                    | Extract a pure step into its own `<name>.function.ts` and test it.                                                                                           |
| `max-lines` (150)                                | Split by concern into files of their own (one export each). Specs: split the `describe` into two spec files.                                                 |
| `complexity` (10), `max-depth` (3)               | Replace `switch`/`if` chains with a typed lookup table in a `.map.ts` (`Record<EnumValue, Handler>`, see `cli-handlers.map.ts`); early returns for guards.   |
| `@typescript-eslint/max-params` (5)              | Pass one options object typed by an `.interface.ts`.                                                                                                         |
| `C9` (`new Date`, `Date.now`, `setTimeout`)      | Inject the `Clock` port; tests use `FixedClock`.                                                                                                             |
| `C9` (`Math.random`)                             | Inject `RandomSource`; tests use `SequenceRandom`.                                                                                                           |
| `C10` (`fetch`, `process.env`)                   | Use the `HttpClient` port; read the environment only in a `.config.ts`.                                                                                      |
| `consistent-type-assertions` (no `as`)           | Parse untrusted data with Zod; narrow with a type guard; use `satisfies` for literals.                                                                       |
| `no-non-null-assertion` (`!`)                    | Handle the `undefined` that `noUncheckedIndexedAccess` reports: `?.` and `?? null`, or a guard that throws a named error.                                    |
| `no-extraneous-class` (static-only class)        | Turn it into exported functions, one per file.                                                                                                               |
| `explicit-function-return-type`                  | Write the return type, specs included.                                                                                                                       |
| `C4` (TypeScript `enum`)                         | `Object.freeze({ … } as const)` in `.enum.ts`, value type in `.type.ts` (`provider-id.enum.ts`, `provider-id.type.ts`).                                      |

## Typecheck

- `exactOptionalPropertyTypes`: do not assign `undefined` to an optional property; spread conditionally,
  `...(zoom === null ? {} : { zoom })` (see `run-batch.function.ts`).
- `noUncheckedIndexedAccess`: `array[0]` is `T | undefined`; handle it.
- `erasableSyntaxOnly` (TS1294): no constructor parameter properties, enums or namespaces; declare fields and assign
  them in the constructor.
- Relative imports end in `.ts`.

## Other gates

- `format:check`: run `pnpm format`.
- `check:one-export`: move the second export to its own file named after it; re-export public symbols from
  `src/index.ts` only.
- `check:deps`: the rule name says which layer boundary was crossed (`domain-is-pure`,
  `application-depends-on-ports`, `providers-are-independent`, `library-core-runs-anywhere`, `codex-hooks-stand-alone`, `no-orphans`, …). Move the
  code to the layer that may import it, or add a port in `application/ports` with an adapter in `infrastructure`.
  `no-orphans`: delete the unused module or import it where it belongs.
- `test:coverage`: thresholds are domain 95, application 95, overall 85 (lines). Add tests for the uncovered
  branches; recorded tests for providers, scripted error answers for failure paths.
- `build`: `tsconfig.build.json` compiles `src` without specs and fixtures; a build-only error is usually a spec or
  fixture imported from `src`.

If a rule blocks correct code and none of the fixes above apply, stop and report the case; do not change the rule.
