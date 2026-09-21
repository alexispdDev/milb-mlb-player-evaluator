import { describe, expect, it } from 'vitest'
import { formatMetricValue, isAboveAverage } from './metricFormat'

describe('formatMetricValue', () => {
  it('formats units', () => {
    expect(formatMetricValue(12.8, '%')).toBe('12.8%')
    expect(formatMetricValue(91.5, 'MPH')).toBe('91.5 MPH')
    expect(formatMetricValue(14.2, '°')).toBe('14.2°')
    expect(formatMetricValue(23, '%')).toBe('23.0%')
  })
})

describe('isAboveAverage', () => {
  it('handles direction, ties and null', () => {
    expect(isAboveAverage({ value: 9, leagueAvg: 8, inverted: false })).toBe(true)
    expect(isAboveAverage({ value: 7, leagueAvg: 8, inverted: false })).toBe(false)
    expect(isAboveAverage({ value: 7, leagueAvg: 8, inverted: true })).toBe(true)
    expect(isAboveAverage({ value: 9, leagueAvg: 8, inverted: true })).toBe(false)
    expect(isAboveAverage({ value: 8, leagueAvg: 8, inverted: true })).toBe(false)
    expect(isAboveAverage({ value: 8, leagueAvg: 8, inverted: false })).toBe(false)
    expect(isAboveAverage({ value: null, leagueAvg: 8, inverted: false })).toBe(false)
  })
})
