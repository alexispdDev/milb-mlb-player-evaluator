# Frontend Technical Specification: MLB Hitter Analytics Portal (v1)

**Document Status:** Approved / Ready for Implementation  
**Version:** 1.0  
**Target Release:** MVP Milestone 1–4  

---

## 1. Project Overview & Objectives

### 1.1 Summary
A specialized desktop analytics frontend designed to evaluate MLB hitters by visualizing key underlying Statcast metrics, quality-of-contact indicators, and rolling performance trends against league benchmarks.

### 1.2 Target Audience
* **Primary (Phase 1):** Personal use for player evaluation, prospect tracking, and breakout detection.
* **Secondary (Phase 2):** Potential migration into a public/private analytical SaaS product.

### 1.3 Core Value & Objectives
* **Identify Breakout Candidates:** Surface underlying shifts in exit velocity, hard-hit rates, and plate discipline before traditional box-score counting stats reflect them.
* **Contextual Benchmarking:** Compare player metrics directly to league-average baselines using intuitive visual gauges.
* **Rapid Exploration:** Deliver zero-latency switching between player profiles via local in-memory datasets.

---

## 2. Scope Boundaries (v1)

### 2.1 In-Scope
* **Single Core View — Player Profile Dashboard:**
  * **Top Bar Controls:** Searchable player selector and season switch (2024 / 2025).
  * **Player Identity Card:** Photo, name, team badge, position, handedness (bats/throws), age, and seasonal summary statistics ($PA, HR, AVG, OPS$).
  * **Statcast Metrics Grid:** 8 core metrics represented as semicircular visual gauges displaying raw player values, animated needles, and league-average benchmarks.
  * **Visual Breakdown Chart:** Rolling 50-plate-appearance trend line tracking contact quality across the season.
* **Data Strategy:** Client-side local JSON mock fixtures simulating realistic Statcast feeds.
* **Device Target:** Desktop-first responsive layout (minimum supported width: $1024\text{px}$, optimized for $1440\text{px}+$ displays).

### 2.2 Explicitly Out-of-Scope (Deferred to Future Versions)
* **Minor League (MiLB) Integration:** Deferred to v2 due to park-by-park data asymmetry.
* **Pitchers:** Pitcher metrics (Stuff+, Spin Rate, Velocity, Whiff splits) deferred to v2.
* **League-Wide Leaderboard & Comparison:** Multi-player tables and side-by-side player comparisons deferred to future iterations.
* **Authentication & Backend:** No user logins, account databases, or external network dependencies.
* **Live In-Game Feeds:** No pitch-by-pitch real-time streaming data.
* **Theming Controls:** Locked into a single dark-mode dashboard theme.

---

## 3. Functional Requirements (FRs)

### FR-01: Global Navigation & Player Selection
* **Description:** The user can switch between different hitters and seasons without a page reload.
* **Acceptance Criteria:**
  * Changing the player dropdown updates the Identity Card, Gauge Grid, and Trend Line simultaneously.
  * Dropdown includes a search input with typeahead filtering by player name.
  * Switching the season toggle dynamically loads the corresponding season profile for the active player.

### FR-02: Player Identity Card
* **Description:** Displays the biographical details and high-level seasonal summary for the selected hitter.
* **Acceptance Criteria:**
  * Renders headshot image, team abbreviation badge, full name, primary position, and bats/throws handedness.
  * Displays a summary pill bar with:
    * Plate Appearances ($PA$)
    * Home Runs ($HR$)
    * Batting Average ($AVG$)
    * On-Base Plus Slugging ($OPS$)

### FR-03: Statcast Gauge Grid (8 Core Metrics)
* **Description:** A responsive grid displaying 8 semicircular gauge components to visualize underlying contact quality and plate discipline.
* **Metrics Included:**
  1. **Barrel%** (e.g., Value: $12.8\%$, Avg: $8.5\%$)
  2. **Hard-Hit%** (e.g., Value: $49.2\%$, Avg: $40.2\%$)
  3. **Average Exit Velocity** (e.g., Value: $91.5\text{ MPH}$, Avg: $89.1\text{ MPH}$)
  4. **Average Launch Angle** (e.g., Value: $14.2^\circ$, Avg: $12.5^\circ$)
  5. **Sweet Spot%** (e.g., Value: $38.1\%$, Avg: $33.0\%$)
  6. **Max Exit Velocity** (e.g., Value: $113.3\text{ MPH}$, Avg: $109.8\text{ MPH}$)
  7. **Whiff%** (e.g., Value: $18.5\%$, Avg: $23.0\%$ — *inverted scale: lower is better*)
  8. **Chase%** (e.g., Value: $24.0\%$, Avg: $28.5\%$ — *inverted scale: lower is better*)
* **Acceptance Criteria for Each Gauge Card:**
  * Displays the metric title at the top of each card.
  * Renders a semicircular arc with an indicator needle pointing to the percentile position ($0^\circ$ to $180^\circ$).
  * Displays the raw player value centered within or directly over the gauge.
  * Shows the league benchmark string clearly below the gauge (e.g., `Avg: 8.5%`).
  * Applies dynamic color accents:
    * **Red spectrum:** Above-average performance (or below-average for Whiff/Chase).
    * **Blue spectrum:** Below-average performance (or above-average for Whiff/Chase).

### FR-04: Rolling Trend Line Chart
* **Description:** Visualizes performance trajectory over the course of the season.
* **Acceptance Criteria:**
  * X-axis plots cumulative Plate Appearances ($PA$).
  * Y-axis plots the rolling metric (e.g., Rolling Hard-Hit% over the last 50 PA).
  * Hovering over a data point reveals a tooltip with the specific plate appearance index and value (e.g., `PA #400: 51.5%`).

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Target Platforms & Responsiveness
* **Device Target:** Desktop-first layout.
  * Primary target resolutions: $1440 \times 900\text{px}$ and $1920 \times 1080\text{px}$.
  * Minimum supported desktop viewport: $1024\text{px}$ width.
  * Breakpoint behavior: At $< 1024\text{px}$, the gauge grid collapses from 4 columns to 2 columns without overlapping text.
* **Browser Compatibility:** Modern evergreen desktop browsers (Chrome, Safari, Firefox, Edge; last 2 major versions).

### 4.2 Performance Budgets
* **Page Load:** Time to Interactive (TTI) under $1.0\text{s}$ using local JSON fixtures.
* **Gauge & Chart Smoothness:** Needle sweeps and chart hover transitions must maintain $60\text{ fps}$.
* **Player Switch Latency:** Re-rendering upon player selection must complete within $100\text{ms}$.

### 4.3 Design System & Theming
* **Dark-Mode Palette:**
  * Main background: `#0B131E`
  * Card surface: `#1E293B`
  * Header/nav bar: `#15202B`
  * Primary text: `#F8FAFC`
  * Subtext / League benchmarks: `#94A3B8`
  * Above-average accent (Red): `#EF4444` / `#E11D48`
  * Below-average accent (Blue): `#3B82F6` / `#2563EB`
* **Contrast Compliance:** All text-to-background contrast ratios must meet WCAG 2.1 AA ($4.5:1$ minimum).

### 4.4 Accessibility (a11y)
* **Screen Readers:** Every gauge card must supply a structured ARIA label:  
  `aria-label="Barrel Percentage: 12.8 percent, League Average: 8.5 percent"`
* **Keyboard Flow:** The player dropdown and season switch must be fully operable via standard keyboard controls (`Tab`, `Enter`, arrow keys) with clear focus indicators.

---

## 5. Mock Data Structure (JSON Contract)

The frontend consumes an array of player profile objects stored in a local fixture file (`src/data/players.json`).

```json
[
  {
    "id": "mlb-518692",
    "season": 2024,
    "identity": {
      "fullName": "Freddie Freeman",
      "team": "LAD",
      "teamLogoUrl": "/assets/logos/lad.svg",
      "headshotUrl": "/assets/players/518692.png",
      "primaryPosition": "1B",
      "bats": "L",
      "throws": "R",
      "age": 34
    },
    "summary": {
      "plateAppearances": 580,
      "homeRuns": 21,
      "battingAverage": ".305",
      "ops": ".910"
    },
    "metrics": [
      {
        "id": "barrel_rate",
        "name": "BARREL%",
        "value": 12.8,
        "unit": "%",
        "leagueAvg": 8.5,
        "percentile": 94,
        "inverted": false
      },
      {
        "id": "hard_hit_rate",
        "name": "HARD-HIT%",
        "value": 49.2,
        "unit": "%",
        "leagueAvg": 40.2,
        "percentile": 88,
        "inverted": false
      },
      {
        "id": "avg_ev",
        "name": "EXIT VELOCITY (AVG)",
        "value": 91.5,
        "unit": "MPH",
        "leagueAvg": 89.1,
        "percentile": 82,
        "inverted": false
      },
      {
        "id": "avg_la",
        "name": "LAUNCH ANGLE (AVG)",
        "value": 14.2,
        "unit": "°",
        "leagueAvg": 12.5,
        "percentile": 65,
        "inverted": false
      },
      {
        "id": "sweet_spot_rate",
        "name": "SWEET SPOT%",
        "value": 38.1,
        "unit": "%",
        "leagueAvg": 33.0,
        "percentile": 91,
        "inverted": false
      },
      {
        "id": "max_ev",
        "name": "MAX EXIT VELO",
        "value": 113.3,
        "unit": "MPH",
        "leagueAvg": 109.8,
        "percentile": 76,
        "inverted": false
      },
      {
        "id": "whiff_rate",
        "name": "WHIFF%",
        "value": 18.5,
        "unit": "%",
        "leagueAvg": 23.0,
        "percentile": 78,
        "inverted": true
      },
      {
        "id": "chase_rate",
        "name": "CHASE%",
        "value": 24.0,
        "unit": "%",
        "leagueAvg": 28.5,
        "percentile": 55,
        "inverted": true
      }
    ],
    "trend": {
      "metricName": "Hard-Hit% Rolling (Last 50 PA)",
      "points": [
        { "pa": 50, "value": 46.0 },
        { "pa": 100, "value": 48.2 },
        { "pa": 200, "value": 52.0 },
        { "pa": 300, "value": 49.8 },
        { "pa": 400, "value": 51.5 },
        { "pa": 500, "value": 48.9 },
        { "pa": 580, "value": 49.2 }
      ]
    }
  }
]
```

---

## 6. Component Hierarchy & UI States

### 6.1 Component Tree
```text
App
└── DashboardLayout
    ├── TopNavigation
    │   ├── AppBrand
    │   ├── PlayerSelector
    │   └── SeasonToggle
    │
    ├── PlayerIdentityCard
    │   ├── HeadshotFrame
    │   ├── PlayerBio
    │   └── SummaryStatsBar
    │
    └── MainAnalyticsGrid
        ├── StatcastMetricsSection
        │   └── GaugeGrid (4x2 CSS Grid)
        │       └── StatcastGaugeCard (x8 instances)
        │           ├── CardHeader
        │           ├── SemicircularGauge (SVG arc + needle)
        │           ├── MetricValueDisplay
        │           └── LeagueBenchmarkDisplay
        │
        └── VisualBreakdownSection
            └── RollingTrendChartCard
                ├── ChartHeader
                └── TrendLineChart
```

### 6.2 UI Edge States
* **Ideal State:** Data populated; gauges sweep to target positions upon initial render.
* **Switching / Loading State:** Skeleton placeholder cards match gauge grid dimensions during transitions.
* **Empty Search State:** Dropdown notifies `"No player found matching '{query}'"` while keeping current profile view intact.
* **Missing Metric State:** If sample size is insufficient, display neutral grey gauge arc with `"N/A"` label.
* **Data Load Error State:** Show inline alert banner with a `"Reload Application"` recovery action.

---

## 7. Implementation Plan & Milestones

### Milestone 1: Setup & Design Foundations
* Initialize the project with the stack defined in §8.
* Configure CSS variables for colors, surface elevations, and typography.
* Store the mock data fixture at `src/data/players.json`.
* Construct the main `DashboardLayout` shell.

### Milestone 2: Static Component Construction
* Build `PlayerIdentityCard` displaying headshot, biography, and summary pills.
* Develop the reusable `StatcastGaugeCard`:
  * Semicircular SVG gauge arc.
  * Needle rotation calculation: $\text{angle} = (\text{percentile} / 100) \times 180^\circ$.
  * Conditional red/blue styling respecting the `inverted` flag.
  * League benchmark text.
* Assemble 8 gauges into the `GaugeGrid`.
* Build `RollingTrendChartCard` plotting rolling performance data points.

### Milestone 3: State & Dynamic Data Flow
* Implement root reactive state for `selectedPlayerId` and `selectedSeason`.
* Hook up `TopNavigation` controls (searchable player dropdown and season switch).
* Feed active player data into the Identity Card, Gauge Grid, and Trend Line.

### Milestone 4: Edge Cases, Accessibility & Final Polish
* Add CSS needle transition animations and skeleton loading wrappers.
* Implement missing-metric fallbacks (`"N/A"` states).
* Add ARIA labels across all gauges and audit keyboard focus traps.
* Validate performance budgets and contrast ratios.

---

## 8. Tech Stack (Decided)

| Area | Choice | Notes |
|---|---|---|
| Build tool | Vite | Static build, no backend in v1. |
| UI framework | React + TypeScript | |
| Styling | Tailwind CSS | Palette from §4.3 defined as theme tokens / CSS variables; single dark theme. |
| Gauges | Hand-written SVG | Semicircular arc + needle, CSS transitions for the sweep. |
| Trend chart | Recharts (visx if more control is needed) | One line chart with tooltip. |
| Player selector | Headless UI Combobox | Typeahead and keyboard support required by §4.4. |
| State | `useState` / `useReducer` | Only `selectedPlayerId` and `selectedSeason`. |
| Data contract | Zod schema (or plain TS types) for §5 | Validates the fixture now and a real feed later. |
| Testing | Vitest + React Testing Library, axe for a11y checks | Covers ARIA labels and contrast requirements. |

**Rationale:** Most widely supported stack, matches the v1 scope (single view, local JSON, no backend), and leaves a clear path to an API for the Phase 2 SaaS.
