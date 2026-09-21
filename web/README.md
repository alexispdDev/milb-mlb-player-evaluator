# Web frontend

Single-page dashboard for MLB hitter analytics: pick a player and a season, see
Statcast gauges and a rolling trend chart. v1 reads a local JSON fixture; there
is no backend. Full spec: [`../_docs/frontend-plan.md`](../_docs/frontend-plan.md).

Stack: Vite, React 19, TypeScript, Tailwind v4, Recharts, Headless UI, Zod,
Vitest + React Testing Library + vitest-axe.

## Prerequisites

- Node 24 is the recommended version: it is what CI runs (from `.nvmrc`). With
  [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in `web/` to select it.
- The supported range is the `engines.node` value in `package.json`:
  `^22.22.2 || ^24.15.0 || ^26.0.0`. It is stricter than Vite's own
  requirement (`^20.19.0 || >=22.12.0`) because the `jsdom` version used by
  Vitest requires `^22.22.2 || ^24.15.0 || >=26.0.0`, and Vitest itself excludes
  Node 25. Node 20 and 22.12 to 22.21 therefore cannot run the tests.
- Verified in a fresh clone (`npm ci` then `npm run check`): 22.22.2, 22.23.2,
  24.15.0, 24.21.0, 26.0.0 and 26.9.0. Node 27 and later are not verified and
  not claimed.
- The range is enforced twice:
  - `.npmrc` sets `engine-strict=true`, so `npm install` / `npm ci` fail
    (`EBADENGINE`) on an unsupported Node.
  - A run-time guard, `scripts/check-node.mjs`, runs as the `predev`,
    `prebuild`, `pretest`, `pretest:watch`, `prepreview` and `precheck` hooks. It
    catches the case `engine-strict` cannot: `node_modules` installed under a
    supported Node, then a command run under an unsupported one. It reads the
    range from `package.json`, prints a two-line message and exits 1.

## Quick start

Run from `web/`:

```sh
nvm use
npm ci
npm run dev
```

## Scripts

| Script                 | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server.                                              |
| `npm run build`        | `tsc -b && vite build`: type check, then production build to `dist/`.   |
| `npm run lint`         | Lint with oxlint.                                                       |
| `npm test`             | Run the whole Vitest suite once (`vitest run`).                         |
| `npm run test:watch`   | Run Vitest in watch mode.                                               |
| `npm run preview`      | Serve the production build (`vite preview`); run `npm run build` first. |
| `npm run format`       | Rewrite all files with Prettier (`prettier --write .`).                 |
| `npm run format:check` | Check formatting with Prettier without changing files.                  |
| `npm run check`        | `lint` + `format:check` + `test` + `build`, in that order.              |

The `dev`, `build`, `test`, `test:watch`, `preview` and `check` scripts first run
the Node version guard (see Prerequisites). `lint` and `format*` do not.

Run a single test file:

```sh
npx vitest run src/data/players.test.ts
```

## Source layout

```text
src/
  main.tsx               entry point
  App.tsx                top-level component
  useDashboardState.ts   selected player and season state
  contrast.ts            WCAG contrast helpers
  index.css              Tailwind import and theme tokens
  setupTests.ts          Vitest setup
  data/
    schema.ts            Zod schema for player profiles
    players.json         the fixture (see below)
    loadPlayers.ts       validates and exposes the fixture
  components/            UI components (gauges, trend chart, selector, layout)
```

Tests are colocated with the code they cover as `*.test.ts` / `*.test.tsx`.

## Fixture: `src/data/players.json`

The file is an array of player-season profiles, validated by
`playerProfilesSchema` in `src/data/schema.ts`. Invariants, and where each is
enforced:

In `src/data/players.test.ts`:

- Parses with `playerProfilesSchema` (test "parses with playerProfilesSchema").
- Exactly 8 metrics per profile with ids in this order: `barrel_rate`,
  `hard_hit_rate`, `avg_ev`, `avg_la`, `sweet_spot_rate`, `max_ev`,
  `whiff_rate`, `chase_rate`; `inverted` is `true` only for `whiff_rate` and
  `chase_rate` (test "has exactly 8 metrics in FR-03 order, inverted only for
  whiff and chase").
- `(id, season)` pairs are unique, and there are at least 4 distinct players,
  each with both a 2024 and a 2025 profile (test "has 4+ players, each with 2024
  and 2025, and unique (id, season) pairs").
- Each trend has at least 7 points and the last point's `pa` equals
  `summary.plateAppearances` (test "has trends of 7+ points ending at the plate
  appearance total").
- `value` and `percentile` are null together; at least one such null-metric case
  must stay in the file; at least one `identity.fullName` of 30 or more
  characters must stay in the file (test "has a null-metric case (value and
  percentile null together) and a long name").

In `src/data/schema.ts` (tested by `src/data/schema.test.ts`):

- Trend `pa` values are strictly increasing.
- Metric ids are unique within a profile.
- `percentile` is between 0 and 100 (or null).
- `bats` and `throws` are one of `L`, `R`, `S`.

After editing the fixture, run `npx vitest run src/data/players.test.ts`, then
`npm test`, which must pass.

`teamLogoUrl` and `headshotUrl` in the fixture must point at files in
`web/public/assets/`. Those files are generated placeholders (flat shapes and
flat-colour squares), not real MLB logos or player photos. `src/data/assets.test.ts`
fails if a fixture URL has no matching file. Adding a fixture player therefore
requires adding its image files.

## CI

`.github/workflows/ci.yml` runs `npm ci` and then `npm run check` from `web/`.
Node comes from `web/.nvmrc` (24), on pushes to `main` and on pull requests.
`npm run check` reproduces it locally.

## Troubleshooting

Symptom, on an unsupported Node such as 18, when the guard is bypassed by
running `vite` directly (`node node_modules/vite/bin/vite.js --version` with
`node_modules` installed by Node 24):

```text
file:///.../web/node_modules/rolldown/dist/shared/create-bundler-option-DJpvtSqr.mjs:8
import { formatWithOptions, styleText } from "node:util";
                            ^^^^^^^^^
SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'
    at ModuleJob._instantiate (node:internal/modules/esm/module_job:123:21)
    at async ModuleJob.run (node:internal/modules/esm/module_job:191:5)
    at async ModuleLoader.import (node:internal/modules/esm/loader:337:24)

Node.js v18.20.8
```

Cause: an unsupported Node (`styleText` needs Node 20.12+, and the toolchain
needs the range under Prerequisites). Fix: `nvm use` in `web/`, then `npm ci` if
`node_modules` was installed with another Node.

The guard message now appears first, before anything else runs:

```text
This project needs Node ^22.22.2 || ^24.15.0 || ^26.0.0 (recommended: 24, see .nvmrc); you are running 18.20.8.
Fix: run `nvm use` in web/ (then `npm ci` if node_modules was installed with another Node).
```

A plain shell may not load nvm, so `nvm` (or the Node you expect) is missing:
run `source ~/.nvm/nvm.sh` first.

## Known limitations and manual checks

Some behaviour can only be judged by a human in a browser (layout at several
widths, focus rings, needle animation, the error banner). The checklist is the
"Known unverified" section of
[`../_docs/performance.md`](../_docs/performance.md); use `npm run preview`
after a build. This README has no screenshots.

## Process

How work is organized: [`../_docs/process.md`](../_docs/process.md).
