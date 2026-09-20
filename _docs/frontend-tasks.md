# Task Backlog: MLB Hitter Analytics Portal (v1)

Source of truth for requirements is [frontend-plan.md](frontend-plan.md); section numbers (§) below refer to it. The frontend lives in a new `web/` directory so it does not touch the existing Python scaffold at the repo root. All paths like `src/...` are relative to `web/`.

## 1. Set up an empty project with a passing test
Goal: A Vite + React + TypeScript project in `web/` that builds, runs, and passes one test.
Description: Scaffold the project per the tech stack in §8 (Vite, React, TypeScript) and add Vitest with React Testing Library. Add a single smoke test that renders a placeholder `App` and asserts some text is present, and make `npm test` and `npm run build` both succeed. Do not add Tailwind, data, or any real UI yet.

## 2. Add Tailwind CSS with dark-mode design tokens
Goal: Tailwind is configured with the §4.3 palette as theme tokens and a locked dark theme.
Description: Install and configure Tailwind in the existing `web/` Vite project, defining the §4.3 colors (background `#0B131E`, card `#1E293B`, header `#15202B`, text `#F8FAFC`, subtext `#94A3B8`, red `#EF4444`/`#E11D48`, blue `#3B82F6`/`#2563EB`) as CSS variables and Tailwind theme colors. Set the page background and default text color globally and add a test or visible check that a token-styled element renders.

## 3. Define the player data contract (Zod schema and types)
Goal: A Zod schema and inferred TypeScript types for the §5 JSON contract.
Description: In `src/data/schema.ts`, model a player profile with `id`, `season`, `identity`, `summary`, `metrics` (each with `id`, `name`, `value`, `unit`, `leagueAvg`, `percentile`, `inverted`), and `trend` (`metricName`, `points` of `{pa, value}`). Allow `value` and `percentile` to be `null` so the missing-metric state (§6.2) can be represented. Add unit tests that accept the §5 example object and reject malformed ones (e.g. percentile outside 0-100, missing field).

## 4. Create the mock player fixture
Goal: `src/data/players.json` contains realistic profiles that validate against the schema.
Description: Author fixtures for at least 4 hitters, each with both 2024 and 2025 seasons, all 8 metrics from FR-03 (in the order listed there), and a trend series of 7+ points. Include one player with a metric whose `value` and `percentile` are `null`, and one player with a long name, to exercise edge states later. Add a test that parses the whole file with the schema from task 3 (if the schema does not exist yet, use the §5 example shape and swap in the schema when available).

## 5. Build the data-loading module
Goal: A function that loads and validates the fixture and exposes typed lookups.
Description: Create `src/data/loadPlayers.ts` that reads `players.json`, validates it with the Zod schema, and returns either the parsed profiles or a typed error. Provide helpers to list unique players, get a profile by `(playerId, season)`, and filter players by a name query (case-insensitive substring). Cover success, invalid-data, and no-match cases with unit tests.

## 6. Build the DashboardLayout shell and TopNavigation frame
Goal: A static page frame with header bar, identity area, and analytics area placeholders.
Description: Implement `DashboardLayout` and `TopNavigation` (with `AppBrand` and empty slots for the player selector and season toggle) using the §4.3 header/background colors and a max content width suited to 1440px+ displays. The layout must remain usable down to 1024px wide. Render placeholder regions for the identity card, gauge grid, and trend chart, and test that all regions are present.

## 7. Build the PlayerIdentityCard
Goal: A component showing a hitter's bio and season summary from a profile object.
Description: Render headshot (`HeadshotFrame`), team badge with abbreviation, full name, primary position, bats/throws, age, and a `SummaryStatsBar` with PA, HR, AVG, and OPS as pills (FR-02). Handle a missing or broken headshot with an initials fallback, and make sure long names do not break the layout. Test rendering from a fixture-shaped prop.

## 8. Build the SemicircularGauge SVG primitive
Goal: A pure, reusable SVG gauge that renders an arc and a needle for a given percentile.
Description: Hand-write an SVG semicircle with a needle whose angle is `(percentile / 100) * 180°` per §7 Milestone 2, taking `percentile` and a `color` as props. Export the angle/arc math as a pure function and unit test the boundaries (0, 50, 100) and clamping of out-of-range inputs. No animation, labels, or card chrome here.

## 9. Build the StatcastGaugeCard
Goal: A card that shows one metric using the gauge with value, benchmark, and correct color.
Description: Compose `CardHeader`, `SemicircularGauge`, `MetricValueDisplay` (value plus unit), and `LeagueBenchmarkDisplay` (e.g. `Avg: 8.5%`) per FR-03. Apply the red spectrum for above-average performance and blue for below-average, flipping the mapping when the metric is `inverted` (Whiff%, Chase%). Test color selection for normal and inverted metrics and the displayed strings.

## 10. Build the responsive GaugeGrid
Goal: A grid that renders all 8 metric cards, 4 columns wide, collapsing to 2 below 1024px.
Description: Implement `GaugeGrid` taking a list of metrics and rendering one `StatcastGaugeCard` per metric in the given order (4x2 layout, §4.1). Use CSS breakpoints to switch to 2 columns under 1024px without text overlap. Test that 8 cards render and that the grid has the expected responsive classes.

## 11. Build the RollingTrendChartCard
Goal: A line chart of the rolling metric against cumulative plate appearances with a hover tooltip.
Description: Use Recharts to plot `trend.points` with PA on the X axis and the rolling value on the Y axis, styled with the dark palette, and show the `trend.metricName` in a `ChartHeader` (FR-04). The tooltip must read like `PA #400: 51.5%`; extract the tooltip formatting into a pure function and unit test it. Handle an empty points array with a short "No trend data" message.

## 12. Add root state and wire the dashboard to data
Goal: `selectedPlayerId` and `selectedSeason` state drive the identity card, gauge grid, and trend chart.
Description: In `App`, hold the two pieces of state with `useState`/`useReducer` (§8), default to the first player and latest season from the loader, and pass the active profile into the three components. Provide simple temporary controls (or exported setters) so tests can change state. Test that changing either value updates all three sections at once (FR-01), and that a season the player lacks is handled gracefully.

## 13. Build the PlayerSelector combobox
Goal: A searchable, keyboard-accessible player dropdown built on Headless UI Combobox.
Description: Implement typeahead filtering by player name (FR-01) using the filter helper from the data layer, with `Tab`/`Enter`/arrow-key operation and a visible focus ring (§4.4). When nothing matches, show `No player found matching '{query}'` and leave the current selection unchanged (§6.2). Test filtering, selection callback, and the empty-search message with React Testing Library.

## 14. Build the SeasonToggle
Goal: A two-option 2024/2025 control that is fully keyboard operable.
Description: Implement `SeasonToggle` as an accessible segmented control (radio group or tablist semantics) that reports the selected season via callback and shows clear focus and selected states (§4.4). Support arrow-key navigation between options. Test mouse and keyboard selection and the ARIA roles.

## 15. Add skeleton loading states
Goal: Skeleton placeholders matching gauge grid dimensions appear during player/season transitions.
Description: Create skeleton versions of the identity card, gauge cards, and chart card that reserve the same dimensions as the real components to avoid layout shift (§6.2). Show them while the dashboard is in a loading/switching state, controlled by a simple prop or state flag. Test that the skeleton renders 8 gauge placeholders and disappears when data is ready.

## 16. Implement the missing-metric (N/A) gauge state
Goal: Metrics with insufficient sample size render a neutral grey gauge with an `N/A` label.
Description: When a metric's `value` or `percentile` is `null`, render the gauge arc in neutral grey with no needle and show `N/A` in place of the value, still showing the league benchmark (§6.2). Make sure the card's color logic never treats null as 0. Test the N/A rendering and that a normal card is unaffected.

## 17. Add the data load error state
Goal: An inline alert banner with a "Reload Application" action shows when data fails to load or validate.
Description: If the loader returns an error, replace the dashboard body with a banner explaining that data could not be loaded and a `Reload Application` button that reloads the page (§6.2). The top navigation should still render. Test by injecting a failing loader result and asserting the banner and button, with the reload function mocked.

## 18. Add the gauge needle sweep animation
Goal: Needles animate from 0° to their target on initial render and on data change.
Description: Add CSS transitions to the `SemicircularGauge` needle so it sweeps to its target angle on mount and when the percentile changes, keeping the animation on `transform` only to hold 60 fps (§4.2). Respect `prefers-reduced-motion` by disabling the transition. Test that the needle's transform style is set for a given percentile and that the reduced-motion path applies no transition.

## 19. Add ARIA labels to all gauges and run axe checks
Goal: Every gauge card exposes a structured accessible label and passes automated a11y checks.
Description: Give each `StatcastGaugeCard` an `aria-label` in the format `Barrel Percentage: 12.8 percent, League Average: 8.5 percent` (§4.4), with a sensible variant for N/A metrics and for non-percent units such as MPH and degrees. Add `vitest-axe` (or `jest-axe`) and a test that renders the full dashboard and asserts no axe violations. Unit test the label-building function for each of the 8 metrics.

## 20. Audit keyboard flow and focus indicators
Goal: The whole dashboard is operable by keyboard with clear, consistent focus styling.
Description: Verify tab order (player selector, then season toggle, then any other focusable content) and that no focus traps exist, then define one shared focus-ring style using the palette tokens. Write an integration test that drives the selector and season toggle using only keyboard events and asserts the dashboard updates. Note any manual browser checks in the task's PR description.

## 21. Validate WCAG AA contrast for the palette
Goal: Automated proof that all text/background pairs in §4.3 meet a 4.5:1 contrast ratio.
Description: Write a small contrast-ratio utility and a test that checks primary text and subtext against the background, card, and header surfaces, plus red/blue accent text where it is used as text. If any pair fails, propose an adjusted token value in the task notes and update the tokens. Depends only on the palette values listed in §4.3.

## 22. Validate performance budgets
Goal: Measured evidence that load time, player switching, and animation meet the §4.2 budgets.
Description: Build the production bundle and record Time to Interactive using Lighthouse (target under 1.0s), measure the render time of a player switch with the React Profiler or `performance.measure` (target under 100ms), and check the needle and chart transitions for dropped frames. Write results to `_docs/performance.md` and open follow-up tasks for anything over budget. Requires the full dashboard to be assembled.

## 23. Add lint, format, and a CI check
Goal: One command runs lint, type check, tests, and build, and CI runs it on every push.
Description: Add ESLint and Prettier configs for the `web/` project, a `check` npm script chaining lint, `tsc --noEmit`, `vitest run`, and `vite build`, and a GitHub Actions workflow that runs it. Fix any existing lint errors so the check passes on a clean checkout.

## 24. Write the frontend README
Goal: A README that lets a new developer run, test, and understand the frontend in five minutes.
Description: Document prerequisites, the install/dev/test/build commands, the folder layout of `web/`, how to add or edit fixture players, and a link to `_docs/frontend-plan.md`. Verify every command by running it from a fresh clone before finishing.
