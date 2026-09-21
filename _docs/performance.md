# Performance budgets

Evidence for the three budgets in `_docs/frontend-plan.md` section 4.2.
Nothing here is estimated: every number was copied from a command that was run.
Date of measurements: 2026-09-21 (vite v8.3.0, vitest 5.0.1, node v24.21.0, WSL2).

## Budget status

| Budget | Status | Detail |
|---|---|---|
| TTI under 1.0 s (local JSON fixtures) | NOT MEASURED (needs a browser) | No Chrome, Chromium, Firefox, Playwright or Lighthouse is installed, and installing one is a new dependency the project forbids without approval. Manual steps below. |
| 60 fps needle sweep and chart hover | NOT MEASURED (needs a browser) | Same reason. Manual steps below. |
| Player switch under 100 ms | PROXY | jsdom render time, median and max recorded below. Not browser layout or paint. |

Lighthouse and DevTools results are a non-blocking human follow-up. Issue #22
does not wait for them.

## Build sizes

### Before (2026-09-21, single JS chunk)

Command: `. ~/.nvm/nvm.sh && cd web && npm run build` (run 2026-09-21).

Measured after the build with `stat -c %s` (raw) and `gzip -c FILE | wc -c`
(gzip, default level 6). Sizes are in bytes; 1 kB = 1000 bytes. The gzip
figures come from the `gzip` command, so they can differ slightly from the
gzip kB that Vite prints (Vite reports 0.31, 4.21 and 242.07 kB).

| Asset | Raw (bytes) | Gzip (bytes) |
|---|---|---|
| `dist/index.html` | 477 | 320 |
| `dist/favicon.svg` | 9522 | 1516 |
| `dist/assets/index-*.css` | 16324 | 4227 |
| `dist/assets/index-*.js` | 809724 | 239407 |
| `dist/assets/logos/cle.svg` | 310 | 251 |
| `dist/assets/logos/det.svg` | 316 | 254 |
| `dist/assets/logos/lad.svg` | 307 | 242 |
| `dist/assets/logos/nyy.svg` | 324 | 246 |
| `dist/assets/logos/sea.svg` | 327 | 260 |
| `dist/assets/players/518692.png` | 199 | 157 |
| `dist/assets/players/642008.png` | 199 | 157 |
| `dist/assets/players/670541.png` | 199 | 156 |
| `dist/assets/players/681177.png` | 199 | 159 |

`dist/favicon.svg` and the files under `dist/assets/logos/` and
`dist/assets/players/` are copied unhashed from `web/public/`; files in
`web/public/` are copied as they are and Vite does not list them in its
output. The table above is every file in `dist/` (`find dist -type f`). At the
time of this table the build warned "Some chunks are larger than 500 kB after
minification" because Recharts was in the single JS chunk, a risk to the TTI
budget. That warning was resolved by #29 (see the "After" table below).

### After (2026-09-21, #29: trend chart lazy-loaded)

`RollingTrendChartCard` (the only importer of Recharts) is loaded with
`React.lazy`, so it is its own chunk. Command:
`. ~/.nvm/nvm.sh && cd web && npm run build`. Build output lines:

```
dist/index.html                                  0.47 kB │ gzip:   0.31 kB
dist/assets/index-B5P8LApl.css                  16.32 kB │ gzip:   4.21 kB
dist/assets/RollingTrendChartCard-1KwwwMlK.js  353.67 kB │ gzip: 102.72 kB
dist/assets/index-DeIBglJs.js                  457.03 kB │ gzip: 140.22 kB
```

There is no "Some chunks are larger than 500 kB" warning. Every file from
`find dist -type f`, measured with `stat -c %s` and `gzip -c FILE | wc -c`:

| Asset | Raw (bytes) | Gzip (bytes) |
|---|---|---|
| `dist/index.html` | 477 | 320 |
| `dist/favicon.svg` | 9522 | 1516 |
| `dist/assets/index-*.css` | 16324 | 4227 |
| `dist/assets/index-*.js` (React + app) | 457035 | 138791 |
| `dist/assets/RollingTrendChartCard-*.js` (Recharts) | 353678 | 101433 |
| `dist/assets/logos/cle.svg` | 310 | 251 |
| `dist/assets/logos/det.svg` | 316 | 254 |
| `dist/assets/logos/lad.svg` | 307 | 242 |
| `dist/assets/logos/nyy.svg` | 324 | 246 |
| `dist/assets/logos/sea.svg` | 327 | 260 |
| `dist/assets/players/518692.png` | 199 | 157 |
| `dist/assets/players/642008.png` | 199 | 157 |
| `dist/assets/players/670541.png` | 199 | 156 |
| `dist/assets/players/681177.png` | 199 | 159 |

JS totals (bytes, raw / gzip): before 809724 / 239407 (one chunk), after
810713 / 240224 (457035 + 353678 raw, 138791 + 101433 gzip). The total is
about the same; the gain is that the initial (main) chunk drops from 809724 to
457035 raw bytes (239407 to 138791 gzip) and the chart chunk is fetched when the
chart is first shown. Sizes are documentation only: no test asserts them, because they change with every
dependency bump and the plan has no bundle budget.

## Player switch: PROXY

Test: `web/src/App.perf.test.tsx`. To see the printed median and max, run:

```
cd web && npx vitest run src/App.perf.test.tsx --silent=false --reporter=verbose 2>&1 | grep "PROXY switch"
```

Plain `npx vitest run src/App.perf.test.tsx` hides the `console.info` line
(`--silent=false` alone also printed nothing with the default reporter here; the
verbose reporter shows it). Pass/fail alone needs no flags.

- Renders `App` with the bundled fixture in jsdom and waits for the lazy chart
  chunk (`trend-card`) before timing anything (#29), so the chunk load is not
  part of the switch time.
- 5 warm-up switches, then 20 measured switches, alternating a player switch
  (through the combobox) with a season switch (radio). Each switch is wrapped in
  `performance.now()` around the synchronous `fireEvent` calls, so it covers
  React's synchronous re-render.
- Asserts the MEDIAN is under the ceiling of **100 ms** (median, not mean or a
  single sample, so WSL noise does not cause false failures).

Results on the engineer's machine (WSL2), 2026-09-21, five consecutive runs
with the command above (after the season assertion was added):

| Run | Median | Max | Result |
|---|---|---|---|
| 1 | 4.5 ms | 7.3 ms | pass |
| 2 | 4.6 ms | 7.6 ms | pass |
| 3 | 4.5 ms | 7.4 ms | pass |
| 4 | 4.7 ms | 8.2 ms | pass |
| 5 | 4.7 ms | 7.4 ms | pass |

The full suite (`npm test`) passes with the perf test included. The 100 ms
ceiling was not widened.

Limits of the proxy:

- It measures React render plus jsdom DOM work. It is not browser layout, style
  recalculation or paint, so it is not a substitute for the DevTools measurement.
- WSL and shared machines are noisy; that is why the assertion uses the median
  and a ceiling roughly 20 times the observed values.
- Player switching is synchronous over bundled data; real async loading is out
  of scope for v1 (#28, closed as not planned).

## Manual measurements (human, needs a browser)

Prerequisite: `cd web && npm run build && npm run preview`, then open the URL it
prints in Chrome.

### TTI (budget: under 1.0 s)

1. Open DevTools, Lighthouse panel. Mode: Navigation, device: Desktop, keep
   default throttling. Categories: Performance only.
2. Run the report.
3. Write down: the Time to Interactive value, the Lighthouse version, the date.
4. Pass: TTI under 1.0 s. Fail: 1.0 s or more.

### 60 fps (budget: needle sweep and chart hover)

1. Open DevTools, Performance panel, tick Screenshots, press Record.
2. Switch player a few times (triggers the needle sweep, #18), then hover across
   the trend chart for a few seconds. Stop recording.
3. Write down: the frame rate shown in the Frames track and the number of
   dropped or long frames during the sweeps and the hover.
4. Pass: sustained about 60 fps with no dropped-frame red bars during the sweep
   and the hover. Fail: visible dropped frames or a sustained rate below 60 fps.

## Over-budget rule

For every budget later measured FAIL, the person who measured it files a
follow-up GitHub issue with `gh issue create` and links it here. The >500 kB
chunk warning was filed as #29 and is resolved (see the "After" build table).
No budget was measured FAIL in this task
(the proxy passed), so no new follow-up issue was filed.

## Known unverified

Checklist for a human with a browser (`npm run preview`). None of this blocks
#22.

- [ ] Dashboard layout at 1440, 1024 and 390 px wide (#15, #16, #17): gauges,
  chart and header reflow with no horizontal scroll and no overlapping content.
- [ ] Focus rings (#20): tabbing through the page shows a visible ring on every
  interactive element (player combobox, season toggle, any buttons).
- [ ] Needle sweep (#18): the needle animates smoothly to its new position on
  player switch, and with the OS "reduce motion" setting on it jumps without
  animation.
- [ ] N/A gauge (#16): a metric without a value renders as the design intends
  (clearly N/A, no needle or broken arc).
- [ ] Error banner (#17, #21): it is red and its text is readable against the
  background.
- [ ] Lazy chart (#29): on a real network (DevTools throttling, e.g. Fast 4G) the
  first load time with the split chunks is acceptable, and the switch from the
  trend skeleton to the chart shows no visible flash or layout jump. Not
  measured here (needs a browser).
- [ ] Skeleton (#15): skeleton dimensions match the loaded layout, so nothing
  jumps when the real content appears.
