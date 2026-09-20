import { describe, expect, it } from 'vitest'
import players from './players.json'
import { playerProfilesSchema } from './schema'

const METRIC_IDS = [
  'barrel_rate',
  'hard_hit_rate',
  'avg_ev',
  'avg_la',
  'sweet_spot_rate',
  'max_ev',
  'whiff_rate',
  'chase_rate',
]
const INVERTED = ['whiff_rate', 'chase_rate']

describe('players.json fixture', () => {
  const parsed = playerProfilesSchema.parse(players)

  it('parses with playerProfilesSchema', () => {
    expect(playerProfilesSchema.safeParse(players).success).toBe(true)
  })

  it('has exactly 8 metrics in FR-03 order, inverted only for whiff and chase', () => {
    for (const p of parsed) {
      expect(p.metrics.map((m) => m.id)).toEqual(METRIC_IDS)
      for (const m of p.metrics) {
        expect(m.inverted).toBe(INVERTED.includes(m.id))
      }
    }
  })

  it('has 4+ players, each with 2024 and 2025, and unique (id, season) pairs', () => {
    const pairs = parsed.map((p) => `${p.id}|${p.season}`)
    expect(new Set(pairs).size).toBe(pairs.length)
    const ids = new Set(parsed.map((p) => p.id))
    expect(ids.size).toBeGreaterThanOrEqual(4)
    for (const id of ids) {
      const seasons = parsed.filter((p) => p.id === id).map((p) => p.season)
      expect(seasons.sort()).toEqual([2024, 2025])
    }
  })

  it('has trends of 7+ points ending at the plate appearance total', () => {
    for (const p of parsed) {
      expect(p.trend.points.length).toBeGreaterThanOrEqual(7)
      expect(p.trend.points.at(-1)?.pa).toBe(p.summary.plateAppearances)
    }
  })

  it('has a null-metric case (value and percentile null together) and a long name', () => {
    const metrics = parsed.flatMap((p) => p.metrics)
    for (const m of metrics) {
      expect(m.value === null).toBe(m.percentile === null)
    }
    expect(metrics.some((m) => m.value === null && m.percentile === null)).toBe(true)
    expect(parsed.some((p) => p.identity.fullName.length >= 30)).toBe(true)
  })
})
