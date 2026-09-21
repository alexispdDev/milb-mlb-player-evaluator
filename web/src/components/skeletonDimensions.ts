// Shared by the real components and their skeletons so outer dimensions cannot drift.
// Tailwind scans this file, so the full class strings below are always generated.

export const IDENTITY_CARD_MIN_HEIGHT = 'min-h-[184px]' // p-4 + 80px avatar + summary row
export const IDENTITY_CARD_WRAPPER = 'rounded bg-card p-4'

export const GAUGE_GRID_CLASSES = 'grid grid-cols-2 gap-4 min-[1024px]:grid-cols-4'
export const GAUGE_CARD_MIN_HEIGHT = 'min-h-[200px]' // p-4 + name + gauge + benchmark
export const GAUGE_CARD_WRAPPER = 'flex min-w-0 flex-col items-center gap-2 rounded-lg bg-card p-4'

export const CHART_HEIGHT = 280
export const CHART_HEIGHT_CLASS = 'h-[280px]'
export const TREND_CARD_MIN_HEIGHT = 'min-h-[340px]' // p-4 + header + gap + chart
export const TREND_CARD_WRAPPER =
  'flex min-w-0 flex-col gap-2 rounded-lg bg-card p-4 text-foreground'

export const PULSE = 'motion-safe:animate-pulse'
