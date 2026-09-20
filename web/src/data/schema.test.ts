import { describe, expect, expectTypeOf, it } from 'vitest'
import { playerProfileSchema, playerProfilesSchema, type PlayerProfile } from './schema'

const m = (
  id: string,
  name: string,
  value: number,
  unit: string,
  leagueAvg: number,
  percentile: number,
  inverted = false,
) => ({ id, name, value, unit, leagueAvg, percentile, inverted })

const example = () => ({
  id: 'mlb-518692',
  season: 2024,
  identity: {
    fullName: 'Freddie Freeman',
    team: 'LAD',
    teamLogoUrl: '/assets/logos/lad.svg',
    headshotUrl: '/assets/players/518692.png',
    primaryPosition: '1B',
    bats: 'L',
    throws: 'R',
    age: 34,
  },
  summary: { plateAppearances: 580, homeRuns: 21, battingAverage: '.305', ops: '.910' },
  metrics: [
    m('barrel_rate', 'BARREL%', 12.8, '%', 8.5, 94),
    m('hard_hit_rate', 'HARD-HIT%', 49.2, '%', 40.2, 88),
    m('avg_ev', 'EXIT VELOCITY (AVG)', 91.5, 'MPH', 89.1, 82),
    m('avg_la', 'LAUNCH ANGLE (AVG)', 14.2, '°', 12.5, 65),
    m('sweet_spot_rate', 'SWEET SPOT%', 38.1, '%', 33.0, 91),
    m('max_ev', 'MAX EXIT VELO', 113.3, 'MPH', 109.8, 76),
    m('whiff_rate', 'WHIFF%', 18.5, '%', 23.0, 78, true),
    m('chase_rate', 'CHASE%', 24.0, '%', 28.5, 55, true),
  ],
  trend: {
    metricName: 'Hard-Hit% Rolling (Last 50 PA)',
    points: [
      { pa: 50, value: 46.0 },
      { pa: 100, value: 48.2 },
      { pa: 200, value: 52.0 },
      { pa: 300, value: 49.8 },
      { pa: 400, value: 51.5 },
      { pa: 500, value: 48.9 },
      { pa: 580, value: 49.2 },
    ],
  },
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mutator = (p: any) => void
const rejects = (mutate: Mutator) => {
  const p = example()
  mutate(p)
  expect(playerProfileSchema.safeParse(p).success).toBe(false)
}

describe('playerProfileSchema', () => {
  it('parses the full example as a single profile and as an array', () => {
    expect(playerProfileSchema.safeParse(example()).success).toBe(true)
    expect(playerProfilesSchema.safeParse([example()]).success).toBe(true)
  })

  it('keeps null value and percentile as null', () => {
    const p = example()
    p.metrics[0] = { ...p.metrics[0], value: null, percentile: null } as never
    const r = playerProfileSchema.parse(p)
    expect(r.metrics[0].value).toBeNull()
    expect(r.metrics[0].percentile).toBeNull()
  })

  it('accepts only one of value/percentile being null', () => {
    const a = example()
    ;(a.metrics[0] as { value: number | null }).value = null
    expect(playerProfileSchema.safeParse(a).success).toBe(true)
    const b = example()
    ;(b.metrics[0] as { percentile: number | null }).percentile = null
    expect(playerProfileSchema.safeParse(b).success).toBe(true)
  })

  it('accepts a fractional percentile', () => {
    const p = example()
    p.metrics[0].percentile = 50.5
    expect(playerProfileSchema.safeParse(p).success).toBe(true)
  })

  it('strips unknown keys without failing', () => {
    const p = { ...example(), extra: 1, identity: { ...example().identity, nick: 'x' } }
    const r = playerProfileSchema.safeParse(p)
    expect(r.success).toBe(true)
    expect(r.data).not.toHaveProperty('extra')
    expect(r.data?.identity).not.toHaveProperty('nick')
  })

  it.each<[string, Mutator]>([
    ['percentile 101', (p) => (p.metrics[0].percentile = 101)],
    ['percentile -1', (p) => (p.metrics[0].percentile = -1)],
    ['percentile NaN', (p) => (p.metrics[0].percentile = NaN)],
    ['percentile string "94"', (p) => (p.metrics[0].percentile = '94')],
    ['missing identity', (p) => delete p.identity],
    ['missing leagueAvg', (p) => delete p.metrics[0].leagueAvg],
    ['leagueAvg null', (p) => (p.metrics[0].leagueAvg = null)],
    ['bats "X"', (p) => (p.identity.bats = 'X')],
    ['season "2024"', (p) => (p.season = '2024')],
    ['season 2024.5', (p) => (p.season = 2024.5)],
    ['empty metric id', (p) => (p.metrics[0].id = '')],
    ['empty trend points', (p) => (p.trend.points = [])],
    ['pa of 0', (p) => (p.trend.points[0].pa = 0)],
    ['duplicate metric ids', (p) => (p.metrics[1].id = p.metrics[0].id)],
    ['unordered trend pa', (p) => (p.trend.points[2].pa = 10)],
    ['repeated trend pa', (p) => (p.trend.points[1].pa = 50)],
    ['value Infinity', (p) => (p.metrics[0].value = Infinity)],
  ])('rejects %s', (_name, mutate) => {
    rejects(mutate)
  })

  it('types metric value as number | null', () => {
    expectTypeOf<PlayerProfile['metrics'][number]['value']>().toEqualTypeOf<number | null>()
  })
})
