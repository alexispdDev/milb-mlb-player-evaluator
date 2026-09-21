export const GAUGE_VIEWBOX = '0 0 200 110'
export const GAUGE_CENTER = { x: 100, y: 100 }
export const GAUGE_RADIUS = 80

function round2(n: number): number {
  return Math.round(n * 100) / 100 + 0
}

function clampAngle(angle: number): number {
  // NaN is treated as 0 (the left end of the gauge).
  if (Number.isNaN(angle)) return 0
  return Math.min(180, Math.max(0, angle))
}

/** Converts a percentile (0-100) to a gauge angle in degrees (0-180), clamped. NaN maps to 0. */
export function percentileToAngle(percentile: number): number {
  if (Number.isNaN(percentile)) return 0
  return clampAngle((percentile / 100) * 180)
}

/** Point on the gauge arc for an angle: 0 = left end, 90 = top, 180 = right end. */
export function polarPoint(angle: number): { x: number; y: number } {
  const rad = (clampAngle(angle) * Math.PI) / 180
  return {
    x: round2(GAUGE_CENTER.x - GAUGE_RADIUS * Math.cos(rad)),
    y: round2(GAUGE_CENTER.y - GAUGE_RADIUS * Math.sin(rad)),
  }
}

/** SVG arc path between two gauge angles (span is at most 180 degrees). */
export function gaugeArcPath(fromAngle: number, toAngle: number): string {
  const a = polarPoint(fromAngle)
  const b = polarPoint(toAngle)
  return `M ${a.x} ${a.y} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 ${b.x} ${b.y}`
}
