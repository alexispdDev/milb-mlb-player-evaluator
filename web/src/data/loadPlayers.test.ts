import { describe, expect, it } from 'vitest'
import fixture from './players.json'
import {
  filterPlayers,
  getProfile,
  listPlayers,
  loadPlayers,
  type LoadResult,
} from './loadPlayers'
import { playerProfileSchema, type PlayerProfile } from './schema'

const clone = () => structuredClone(fixture) as Record<string, unknown>[]

function ok(result: LoadResult): PlayerProfile[] {
  if (!result.ok) throw new Error(result.error.message)
  return result.players
}

function errorOf(result: LoadResult) {
  if (result.ok) throw new Error('expected failure')
  return result.error
}

describe('loadPlayers', () => {
  it('loads the bundled fixture: 8 valid profiles', () => {
    const players = ok(loadPlayers())
    expect(players).toHaveLength(8)
    for (const p of players) {
      expect(playerProfileSchema.safeParse(p).success).toBe(true)
    }
    expect(ok(loadPlayers(undefined))).toHaveLength(8)
  })

  it('keeps input order', () => {
    const players = ok(loadPlayers())
    expect(players.map((p) => [p.id, p.season])).toEqual(
      (fixture as PlayerProfile[]).map((p) => [p.id, p.season]),
    )
  })

  it.each([{}, null, 'x', 42])('rejects non-array input %j', (input) => {
    const error = errorOf(loadPlayers(input))
    expect(error.kind).toBe('invalid-schema')
    expect(error.message.length).toBeGreaterThan(0)
  })

  it('fails the whole load on one invalid profile', () => {
    const noIdentity = clone()
    delete noIdentity[3].identity
    const emptyId = clone()
    emptyId[0].id = ''
    const badPercentile = clone()
    ;(badPercentile[0].metrics as { percentile: number }[])[0].percentile = 101
    for (const input of [noIdentity, emptyId, badPercentile]) {
      expect(errorOf(loadPlayers(input)).kind).toBe('invalid-schema')
    }
  })

  it('includes the first issue path in the invalid-schema message', () => {
    const input = clone()
    delete input[0].identity
    expect(errorOf(loadPlayers(input)).message).toContain('identity')
  })

  it('treats an empty array as an empty error', () => {
    const error = errorOf(loadPlayers([]))
    expect(error.kind).toBe('empty')
    expect(error.message).not.toBe('')
  })

  it('rejects duplicate (id, season) and names them', () => {
    const input = clone()
    input.push(structuredClone(input[0]))
    const error = errorOf(loadPlayers(input))
    expect(error.kind).toBe('duplicate-profile')
    expect(error.message).toContain(String(input[0].id))
    expect(error.message).toContain(String(input[0].season))
  })

  it('allows same id across seasons and same season across ids', () => {
    expect(loadPlayers(clone()).ok).toBe(true)
    const all = clone()
    const input = [all[0], all[2]]
    expect(input[0].id).not.toBe(input[1].id)
    input[1].season = input[0].season
    expect(loadPlayers(input).ok).toBe(true)
  })

  it('accepts a null metric value', () => {
    const players = ok(loadPlayers())
    expect(
      players.some((p) => p.metrics.some((m) => m.value === null)),
    ).toBe(true)
  })

  it('does not mutate input', () => {
    const input = clone()
    const before = structuredClone(input)
    loadPlayers(input)
    expect(input).toEqual(before)
  })
})

describe('listPlayers', () => {
  it('returns one summary per id in first-appearance order', () => {
    expect(listPlayers(ok(loadPlayers()))).toEqual([
      { id: 'mlb-518692', fullName: 'Freddie Freeman' },
      { id: 'mlb-670541', fullName: 'Bartholomew Rodriguez-Castellanos' },
      { id: 'mlb-642008', fullName: 'Nick Carver' },
      { id: 'mlb-681177', fullName: 'Marcus Bell' },
    ])
  })

  it('returns [] for []', () => {
    expect(listPlayers([])).toEqual([])
  })

  it('uses the highest-season identity, regardless of input order', () => {
    const players = structuredClone(ok(loadPlayers()))
    const first = players.find((p) => p.season === 2025)!
    const old = players.find((p) => p.id === first.id && p.season === 2024)!
    first.identity.fullName = 'New Name'
    const list = listPlayers([first, old])
    expect(list).toEqual([{ id: first.id, fullName: 'New Name' }])
    expect(listPlayers([old, first])).toEqual(list)
  })
})

describe('getProfile', () => {
  const players = ok(loadPlayers())

  it('returns the exact profile for each season', () => {
    const p25 = getProfile(players, 'mlb-518692', 2025)
    const p24 = getProfile(players, 'mlb-518692', 2024)
    expect(p25?.season).toBe(2025)
    expect(p24?.season).toBe(2024)
    expect(p25).not.toBe(p24)
  })

  it('returns undefined for unknown id, absent season, empty id', () => {
    expect(getProfile(players, 'mlb-0', 2025)).toBeUndefined()
    expect(getProfile(players, 'mlb-518692', 2023)).toBeUndefined()
    expect(getProfile(players, '', 2025)).toBeUndefined()
  })
})

describe('filterPlayers', () => {
  const list = listPlayers(ok(loadPlayers()))
  const names = (q: string) => filterPlayers(list, q).map((p) => p.fullName)

  it('returns a new array with every entry for empty/whitespace query', () => {
    for (const q of ['', '   ']) {
      const out = filterPlayers(list, q)
      expect(out).toEqual(list)
      expect(out).not.toBe(list)
    }
  })

  it('returns [] when nothing matches', () => {
    expect(names('zzz')).toEqual([])
  })

  it('matches on fullName only', () => {
    for (const q of ['518692', 'mlb-', 'LAD']) expect(names(q)).toEqual([])
  })

  it('is case-insensitive, trimmed and substring-based', () => {
    expect(names('FREE')).toEqual(['Freddie Freeman'])
    expect(names('  freeman ')).toEqual(['Freddie Freeman'])
    expect(names('eddie f')).toEqual(['Freddie Freeman'])
    expect(names('rodriguez-cast')).toEqual([
      'Bartholomew Rodriguez-Castellanos',
    ])
  })

  it('preserves input order', () => {
    expect(names('a')).toEqual(
      list.filter((p) => p.fullName.toLowerCase().includes('a')).map((p) => p.fullName),
    )
  })

  it('does not collapse interior whitespace and treats regex chars literally', () => {
    expect(names('Nick  Carver')).toEqual([])
    expect(names('Nick Carver')).toEqual(['Nick Carver'])
    expect(names('.')).toEqual([])
    expect(names('(')).toEqual([])
    const withDot = [{ id: 'x', fullName: 'A. Rod' }]
    expect(filterPlayers(withDot, '.')).toEqual(withDot)
  })
})
