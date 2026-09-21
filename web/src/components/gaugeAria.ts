import type { Metric } from '../data/schema'

const SPOKEN_NAMES: Record<string, string> = {
  barrel_rate: 'Barrel Percentage',
  hard_hit_rate: 'Hard-Hit Percentage',
  avg_ev: 'Average Exit Velocity',
  avg_la: 'Average Launch Angle',
  sweet_spot_rate: 'Sweet Spot Percentage',
  max_ev: 'Maximum Exit Velocity',
  whiff_rate: 'Whiff Percentage',
  chase_rate: 'Chase Percentage',
}

const UNIT_WORDS: Record<string, string> = {
  '%': 'percent',
  MPH: 'miles per hour',
  '°': 'degrees',
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

function withUnit(num: string, unit: string): string {
  const words = UNIT_WORDS[unit] ?? unit
  return words ? `${num} ${words}` : num
}

export function buildGaugeAriaLabel(metric: Metric): string {
  const name = SPOKEN_NAMES[metric.id] ?? toTitleCase(metric.name)
  const avg = withUnit(metric.leagueAvg.toFixed(1), metric.unit)
  const isNa = metric.value === null || metric.percentile === null
  const value = isNa ? 'not available' : withUnit((metric.value as number).toFixed(1), metric.unit)
  return `${name}: ${value}, League Average: ${avg}`
}
