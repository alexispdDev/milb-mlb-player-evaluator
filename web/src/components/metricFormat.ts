import type { Metric } from '../data/schema'

export function formatMetricValue(value: number, unit: string): string {
  const num = value.toFixed(1)
  return unit === '%' || unit === '°' ? `${num}${unit}` : `${num} ${unit}`
}

export function isAboveAverage(
  metric: Pick<Metric, 'value' | 'leagueAvg' | 'inverted'>,
): boolean {
  if (metric.value === null) return false
  return metric.inverted
    ? metric.value < metric.leagueAvg
    : metric.value > metric.leagueAvg
}
