import { describe, expect, it } from 'vitest'
import { formatTrendTooltip } from './trendFormat'

describe('formatTrendTooltip', () => {
  it('formats PA and value', () => {
    expect(formatTrendTooltip(400, 51.5)).toBe('PA #400: 51.5%')
  })
  it('adds .0 to integer values', () => {
    expect(formatTrendTooltip(50, 46)).toBe('PA #50: 46.0%')
  })
  it('rounds to one decimal', () => {
    expect(formatTrendTooltip(100, 48.26)).toBe('PA #100: 48.3%')
    expect(formatTrendTooltip(100, 51.55)).toBe(`PA #100: ${(51.55).toFixed(1)}%`)
  })
  it('handles zero', () => {
    expect(formatTrendTooltip(1, 0)).toBe('PA #1: 0.0%')
  })
  it('prints PA without thousands separator', () => {
    expect(formatTrendTooltip(1200, 40)).toBe('PA #1200: 40.0%')
  })
})
