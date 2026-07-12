# Hoare Logic Proof Checker

<div style="display: flex justify-content: center">
<a href="https://github.com/cyprste2717218/hoare-logic-proof-checker/actions/workflows/main.yml">
<img src="https://img.shields.io/github/actions/workflow/status/cyprste2717218/hoare-logic-proof-checker/main.yml?branch=dev&style=for-the-badge&label=CI%2FCD" />
</a>
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Z3_Solver-4B0082?style=for-the-badge&logo=webassembly&logoColor=white" />
<img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" />
<img src="https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white" />
<img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
<img src="https://img.shields.io/badge/License: MIT-green?style=for-the-badge" />
<div>
<br><br>
<img src="image\Landing Page.png" />
<br><br>
The Hoare Logic Proof Checker is a web-based proof kernel for determining the validity of a Hoare Triple with a given proof body. 

Developed using React + TypeScript and built with Vite, the tool uses [Microsoft's Z3 SMT solver](https://github.com/Z3Prover/z3) via the Z3 WASM module on the client-side. This is perfomed by utilising TS bindings supplied by the [z3-solver npm package](https://www.npmjs.com/package/z3-solver).

The latest release of the tool is currently deployed through vercel at the following url: <br>
https://hoare-logic-proof-checker.vercel.app/

## About

The aim of the tool is to act as an easily accessible teaching aid in the delivery of formal logic courses covering program validation using the [Hoare Logic proof system](https://en.wikipedia.org/wiki/Hoare_logic), providing instant feedback on whether a students proof is valid or invalid. 
By using such tooling in a classroom setting, students can receive feedback and verify/develop their understanding more quickly than reliance on solely pen and paper exerises can provide.<br>
The tooling was developed in the completion of my thesis for my BEng in Computer Science, this [paper can be read here](dissertation.pdf)


### Supported Proof Laws and Format

At current, the tool supports validation of Hoare Logic Proofs using the Assignment Law and Skip Law respectively, this is via a 'fitch-style' notation, as inspired by proof construction within the [Carnap System tooling](https://github.com/Carnap/Carnap). <br><br>
An example of a proof under this format for verifying a Hoare triple under the Assignment Law is shown below:

```
1	x=1 -> x+2 = 3 :arith
2	x=1 -> (x=3)[x |> x+2] :subst 1
3   {x=1} x:=x+2 {x=3} :hassign 2
```

Each proof line is annotated with a suffix indicating the 'rule', either an axiom of the Hoare logic system (starting with the letter 'h', e.g. 'hassign' for the assignment axiom) or a construct which helps show the way in which a Hoare logic axiom provides validation for the Hoare triple. 
<br><br>
Additionally, each suffix is followed by a brief list of numbers, which refer to line numbers of proof statements which support the rule.
<br>
In the above example, suffix `:hassign 2` on line 3 is stating that the content on this line provides sufficient proof for the triple under the Assignment law axiom, due to the valid supporting subtitution shown on line 2.
<br><br>
The syntax of all rules which exist are detailed in the <b>'Reference Guide'</b> section, accessible from the app's sidebar.

## How to Use

1. Open the deployed app at [hoare-logic-proof-checker.vercel.app](https://hoare-logic-proof-checker.vercel.app/), or run it locally (see [Technical Specification](#technical-specification)).
2. Wait for the **Z3 Ready** overlay to finish loading — the solver is a WASM module that is fetched and initialised in the browser before any proof can be checked.
3. Navigate to the **Validator** page from the sidebar and enter a Hoare Logic proof in the text area, using the fitch-style, line-by-line notation described above (each line ending in a rule suffix such as `:arith`, `:subst`, `:hassign`, or `:hskip`).
4. Submit the proof to run it through the two-phase checking pipeline:
   - **Syntax check** — verifies each line matches the expected shape for its rule suffix, and reports formatting errors inline.
   - **Validity check** — for every Hoare-law triple in the proof, resolves its supporting lines and uses Z3 to determine satisfiability, reporting whether the proof is valid or invalid.
5. Consult the **Reference Guide** page (WIP) in the sidebar for the full syntax of every supported rule suffix, including worked examples.
6. Use the **Settings** page to adjust app preferences (WIP).

## Technical Specification

The tool is a client-side single-page application, built with:

- **[React](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/)** for the UI, with **[Vite](https://vite.dev/)** as the build tool and dev server.
- **[Tailwind CSS](https://tailwindcss.com/)**, alongside **[Radix UI](https://www.radix-ui.com/)** primitives (shadcn-style, see [components.json](components.json)), for styling and accessible UI components.
- **[Z3](https://github.com/Z3Prover/z3)** (via the [z3-solver](https://www.npmjs.com/package/z3-solver) npm package) compiled to WebAssembly, run entirely in the browser to perform satisfiability checks that determine proof validity. Because Z3 WASM requires cross-origin isolation, the app sends `Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy` headers, both in local dev ([vite.config.ts](vite.config.ts)) and in production ([vercel.json](vercel.json)).
- **[Jest](https://jestjs.io/)** (via `ts-jest`) for integration testing of the proof-checking pipeline, and **[Cypress](https://www.cypress.io/)** for end-to-end testing.
- **[XO](https://github.com/xojs/xo)** (an ESLint config/wrapper) with Prettier for linting/formatting, enforced via **[Husky](https://typicode.github.io/husky/)** git hooks and **[commitlint](https://commitlint.js.org/)** for conventional commit messages.
- Deployed to **[Vercel](https://vercel.com/)**.

Proof checking is split into two independent phases: a purely syntactic check against a set of regex-defined line formats, followed by a semantic validity check that dispatches each Hoare-law triple to law-specific Z3 constraint-building logic. See [CLAUDE.md](CLAUDE.md) for a full breakdown of the checking pipeline and codebase architecture.

### Local Development

```bash
npm install
npm run dev          # start the Vite dev server
npm run build         # type-check (tsc -b) and build for production
npm run lint          # lint src/**/*.{ts,tsx} with xo --prettier
npm run test           # run the unit, integration and e2e test suites
```

## Project Structure

```
hoare-logic-proof-checker/
├── .husky/                     # Git hooks (commit-msg, pre-commit, pre-push)
├── image/                      # README/screenshot assets
├── public/                     # Static assets served as-is, incl. the Z3 WASM build
├── src/
│   ├── components/
│   │   ├── base/                # Generic Radix-UI-based primitives (shadcn-style)
│   │   ├── custom-sidebar/      # App sidebar (nav, header, settings entry point)
│   │   ├── header-component/    # Top-level app header
│   │   ├── hoare-triple-input/  # Hoare triple input widget
│   │   ├── page-content/
│   │   │   └── pages/           # The three app pages: validator, reference guide, settings
│   │   ├── proof-entry-input/   # Proof textarea, line numbers, error hovercards
│   │   └── z3-ready-overlay/    # Loading overlay shown while Z3 WASM initialises
│   ├── hooks/                   # Shared React hooks
│   ├── lib/                     # Regex formats, proof entry config, misc utilities
│   ├── models/                  # Domain types (proof/error structures, Z3 expression types)
│   ├── utilities/
│   │   ├── handle-proof-syntax-check/       # Phase 1: syntax validation of proof lines
│   │   └── handle-check-proof-validity/     # Phase 2: semantic validation via Z3
│   │       ├── check-proof-content/           # Per-law, non-Z3 content parsing (hassign, hskip, subst, arith)
│   │       ├── validity-check-utils/          # Triple resolution/decomposition helpers
│   │       └── z3-logic/                      # Per-law Z3 constraint construction and dispatch
│   ├── App.tsx                  # Top-level state (current page, proof content, Z3 readiness)
│   └── main.tsx                 # App entry point
├── test/
│   ├── __mocks__/test-data/     # Fixture proofs used across integration tests
│   ├── integration/              # *.it.test.ts — the primary proof-law regression tests
│   ├── unit/                     # *.unit.test.ts (none currently exist)
│   └── e2e/                      # *.e2e.test.ts (none currently exist)
├── dissertation.pdf             # Underlying BEng thesis for the tool
├── vercel.json                  # Deployment config (incl. COOP/COEP headers for Z3 WASM)
├── vite.config.ts               # Vite config (incl. dev-server COOP/COEP headers)
├── jest.config.js               # Jest config (ts-jest, @/* path alias)
└── CLAUDE.md                    # Architecture/contributor documentation
```