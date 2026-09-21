import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type Metric } from '../data/schema'
import { buildGaugeAriaLabel } from './gaugeAria'

const profiles = playerProfilesSchema.parse(players)
const find = (name: string, season: number) =>
  profiles.find((p) => p.identity.fullName === name && p.season === season)!
const freeman = find('Freddie Freeman', 2024)
const carver = find('Nick Carver', 2025)
const metric = (id: string, p = freeman) => p.metrics.find((m) => m.id === id)!

const base: Metric = {
  id: 'foo',
  name: 'FOO BAR',
  unit: 'RPM',
  value: 2400,
  leagueAvg: 2300,
  percentile: 50,
  inverted: false,
}

describe('buildGaugeAriaLabel', () => {
  it.each([
    ['barrel_rate', 'Barrel Percentage: 12.8 percent, League Average: 8.5 percent'],
    ['hard_hit_rate', 'Hard-Hit Percentage: 49.2 percent, League Average: 39.8 percent'],
    [
      'avg_ev',
      'Average Exit Velocity: 91.5 miles per hour, League Average: 88.9 miles per hour',
    ],
    ['avg_la', 'Average Launch Angle: 14.2 degrees, League Average: 12.3 degrees'],
    ['sweet_spot_rate', 'Sweet Spot Percentage: 38.1 percent, League Average: 33.2 percent'],
    [
      'max_ev',
      'Maximum Exit Velocity: 113.3 miles per hour, League Average: 109.6 miles per hour',
    ],
    ['whiff_rate', 'Whiff Percentage: 18.5 percent, League Average: 23.0 percent'],
    ['chase_rate', 'Chase Percentage: 24.0 percent, League Average: 28.4 percent'],
  ])('%s', (id, expected) => {
    expect(buildGaugeAriaLabel(metric(id))).toBe(expected)
  })

  it('N/A fixture case: value and percentile null', () => {
    expect(buildGaugeAriaLabel(metric('max_ev', carver))).toBe(
      'Maximum Exit Velocity: not available, League Average: 109.8 miles per hour',
    )
  })

  it('N/A when value is null but percentile is a number', () => {
    expect(buildGaugeAriaLabel({ ...base, id: 'max_ev', unit: 'MPH', value: null, percentile: 40 })).toBe(
      'Maximum Exit Velocity: not available, League Average: 2300.0 miles per hour',
    )
  })

  it('N/A when value is a number but percentile is null', () => {
    expect(buildGaugeAriaLabel({ ...base, id: 'barrel_rate', unit: '%', percentile: null })).toBe(
      'Barrel Percentage: not available, League Average: 2300.0 percent',
    )
  })

  it('unknown id falls back to title-cased name; unknown unit is used as-is', () => {
    expect(buildGaugeAriaLabel(base)).toBe(
      'Foo Bar: 2400.0 RPM, League Average: 2300.0 RPM',
    )
  })

  it('empty unit gives no trailing space', () => {
    expect(buildGaugeAriaLabel({ ...base, unit: '' })).toBe(
      'Foo Bar: 2400.0, League Average: 2300.0',
    )
  })
})
