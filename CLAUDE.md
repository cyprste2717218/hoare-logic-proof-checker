# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A web-based proof kernel (React + TypeScript + Vite) for checking the validity of Hoare Logic proofs written in a "fitch-style" line-by-line notation. Proof validation logic runs client-side in the browser using Microsoft's Z3 SMT solver via the `z3-solver` WASM bindings. Currently supports the Assignment Law (`hassign`) and Skip Law (`hskip`); other law suffixes (`hcond`, `hseq`, `hwhile`, `arith`, `subst`, `simpf`) are recognized syntactically but not all have full semantic checking implemented.

## Commands

```bash
npm run dev          # start Vite dev server
npm run build         # tsc -b && vite build (also run by pre-push hook)
npm run lint          # xo --prettier on src/**/*.{ts,tsx}
npm run lint-fix       # same, with --fix

npm run test           # runs test:unit, then test:it, then test:end (test:end script is currently misnamed vs test:e2e in scripts)
npm run test:unit      # jest, matches **/*.unit.test.ts (none currently exist — passWithNoTests)
npm run test:it        # jest, matches **/*.it.test.ts — the real integration/proof-logic tests live here
npm run test:e2e       # jest, matches **/*.e2e.test.ts (none currently exist — passWithNoTests)
```

To run a single test file or suite directly with Jest (bypassing the npm script's glob):

```bash
npx jest test/integration/assign-law/valid-proof.it.test.ts
npx jest -t "should validate single expression addition hassign proof"
```

Jest uses `ts-jest` with `testEnvironment: "node"` (see [jest.config.js](jest.config.js)), and the `@/*` path alias resolves to `src/*`, mirroring the Vite alias in [vite.config.ts](vite.config.ts). Because the environment is `node`, the Z3 tests in `test/integration` initialize Z3 via its Node (non-WASM-preload) path — this differs from the browser bootstrap in `App.tsx`.

There is no separate typecheck script; `npm run build` (`tsc -b`) is the typecheck gate, and `npm run lint` is run in the pre-commit hook alongside `npm audit`. `npm run build` runs in the pre-push hook — expect it to be invoked on push.

## Architecture

### Two-phase proof checking pipeline

Proof checking happens in two independent phases, both entered via [src/utilities/proof-handle-utilities.ts](src/utilities/proof-handle-utilities.ts):

1. **Syntax check** — `handleProofSyntaxCheck` (`src/utilities/handle-proof-syntax-check/`). Formats the raw textarea proof string into an array of proof lines, then validates each line against regex patterns defined in [src/lib/regex-formats.ts](src/lib/regex-formats.ts) (`validRegexFormats` for law-suffix detection, `allChecks` for pre/postcondition and program-body shape). Purely syntactic — no Z3 involved. Returns formatted lines plus an `ErrorMsg[]`.

2. **Semantic/validity check** — `handleCheckProofValidity` (`src/utilities/handle-check-proof-validity/handle-check-proof-validity.ts`). Only meaningful once syntax passes. For each proof line that matches a Hoare-law suffix (`hskip`, `hassign`, etc.), `getTripleValidityArr` locates it and calls `validateHoareTripleProof`, which:
   - resolves the supporting proof line(s) referenced by line number (`parseSupportingProofLines`),
   - decomposes the triple + its supporting line(s) into a `CollectedTripleProofLines` structure (`decomposeProofLines`),
   - dispatches to law-specific Z3 logic (`z3-logic/handle-dispatch-hoare-law.ts` → `handleHassignDispatch` / `handleHskipDispatch`) to encode the precondition/program/postcondition as Z3 constraints and check satisfiability.

   The overall proof is valid only if every detected triple is valid (`tripleValidityArr` contains no `false`). If a proof contains no Hoare-law triple at all (only `arith`/`subst`/etc. lines), it is treated as invalid.

### Z3 lifecycle

Z3 is initialized once and cached as a module-level singleton in [src/utilities/handle-check-proof-validity/z3-logic/initialise-z3-funcs.ts](src/utilities/handle-check-proof-validity/z3-logic/initialise-z3-funcs.ts) (`ensureZ3Ready` / `getZ3Context` / `initialiseContext`). In the browser, WASM is preloaded manually via `preload-z3-wasm.ts` with progress callbacks (surfaced through `App.tsx`'s `Z3ReadyOverlay`) so the UI can show load/init progress before the proof validator is usable; this requires the COOP/COEP headers set in both [vite.config.ts](vite.config.ts) and [vercel.json](vercel.json) (Z3 WASM needs cross-origin isolation). `resetZ3Initialization` allows retrying after a failed load. Z3 variable declarations across a proof are tracked with `z3-variable-tracker-class.ts` to avoid redeclaring the same symbolic variable.

### Law-specific logic layout

Under `src/utilities/handle-check-proof-validity/`:
- `check-proof-content/hassign-law-logic/`, `check-proof-content/hskip-law-logic/`, `check-proof-content/subst-law-logic/`, `check-proof-content/arith-law-logic/` — per-law parsing/validation of proof-line content (non-Z3).
- `z3-logic/hassign-law-z3-logic/`, `z3-logic/hskip-law-z3-logic/`, `z3-logic/arith-law-z3-logic/` — per-law Z3 constraint construction/dispatch.

When adding support for a new law, follow this same split: syntax regex in `regex-formats.ts`, content parsing under `check-proof-content/<law>-law-logic/`, Z3 encoding under `z3-logic/<law>-law-z3-logic/`, and dispatch wiring in `handle-dispatch-hoare-law.ts`.

### Types

Domain types live in `src/models/`: `misc.ts` (proof/error/law-type structures shared across syntax + validity checking) and `hoare-law-z3-models.ts` (types specific to building Z3 expressions/constraints — expression parts, dispatch prop tuples, variable dictionaries). Z3 objects themselves are largely untyped (`any`) since `z3-solver` ships without full typings; `no-unsafe-*` eslint rules are disabled locally around Z3 interop code rather than globally.

### UI layer

React components under `src/components/` are grouped by feature (`custom-sidebar/`, `proof-entry-input/`, `page-content/pages/` for the three app pages: validator, reference guide, settings) plus `components/base/` for generic Radix-UI-based primitives (shadcn-style, per [components.json](components.json)). `App.tsx` owns top-level state (current page, proof content/errors, proof validity state, Z3 readiness) and passes it down; there is no external state library.

## Testing notes

- Integration tests (`test/integration/**/*.it.test.ts`) drive the full pipeline end-to-end through `handleCheckProofValidity`/`handleProofSyntaxCheck`, using fixture proofs from [test/__mocks__/test-data/proof-data.ts](test/__mocks__/test-data/proof-data.ts). These are the primary regression tests for proof-law correctness — when changing law logic, check/extend these first.
- `test/unit` and `test/e2e` directories currently only contain `.gitkeep` — no unit or e2e tests exist yet despite the npm scripts wired for them.
