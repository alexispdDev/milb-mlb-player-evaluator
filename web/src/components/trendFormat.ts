export function formatTrendTooltip(pa: number, value: number): string {
  return `PA #${Math.round(pa)}: ${value.toFixed(1)}%`
}
