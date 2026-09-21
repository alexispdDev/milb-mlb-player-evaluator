# Web frontend

Single-page dashboard for MLB hitter analytics: pick a player and a season, see
Statcast gauges and a rolling trend chart. v1 reads a local JSON fixture; there
is no backend. Full spec: [`../_docs/frontend-plan.md`](../_docs/frontend-plan.md).

Stack: Vite, React 19, TypeScript, Tailwind v4, Recharts, Headless UI, Zod,
Vitest + React Testing Library + vitest-axe.

## Prerequisites

- Node 24 is the version CI runs and the version the author verified. No other
  version was tested.
- Upstream requirement: Vite 8 itself requires Node `^20.19.0 || >=22.12.0`
  (from its `engines` field). `package.json` has no `engines` field, so nothing
  in this repo enforces a Node version.

## Quick start

Run from `web/`:

```sh
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

`teamLogoUrl` and `headshotUrl` in the fixture are placeholder paths. The image
files do not exist yet (tracked in
[#27](https://github.com/alexispdDev/milb-mlb-player-evaluator/issues/27)), so
editing the fixture does not require adding images.

## CI

`.github/workflows/ci.yml` runs `npm ci` and then `npm run check` from `web/` on
Node 24, on pushes to `main` and on pull requests. `npm run check` reproduces it
locally.

## Known limitations and manual checks

Some behaviour can only be judged by a human in a browser (layout at several
widths, focus rings, needle animation, the error banner). The checklist is the
"Known unverified" section of
[`../_docs/performance.md`](../_docs/performance.md); use `npm run preview`
after a build. This README has no screenshots.

## Process

How work is organized: [`../_docs/process.md`](../_docs/process.md).
