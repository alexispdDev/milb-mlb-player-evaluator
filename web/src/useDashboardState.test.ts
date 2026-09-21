import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from './data/players.json'
import { playerProfilesSchema, type PlayerProfile } from './data/schema'
import { dashboardReducer, initialDashboardState, useDashboardState } from './useDashboardState'

const base = playerProfilesSchema.parse(players)

function make(id: string, season: number): PlayerProfile {
  const src = base[0]
  return { ...src, id, season, identity: { ...src.identity, fullName: id } }
}

describe('initialDashboardState', () => {
  it("uses the first player and that player's own latest season", () => {
    const data = [make('a', 2024), make('b', 2025)]
    expect(initialDashboardState(data)).toEqual({
      selectedPlayerId: 'a',
      selectedSeason: 2024,
    })
  })
})

describe('dashboardReducer', () => {
  const data = [make('a', 2024), make('a', 2025), make('b', 2024)]
  const state = { selectedPlayerId: 'a', selectedSeason: 2025 }

  it('keeps the season when the new player has it', () => {
    const data2 = [...data, make('b', 2025)]
    expect(dashboardReducer(state, { type: 'selectPlayer', id: 'b', players: data2 })).toEqual({
      selectedPlayerId: 'b',
      selectedSeason: 2025,
    })
  })

  it('falls back to the latest season of a player lacking the season', () => {
    expect(dashboardReducer(state, { type: 'selectPlayer', id: 'b', players: data })).toEqual({
      selectedPlayerId: 'b',
      selectedSeason: 2024,
    })
  })

  it('ignores an unknown player id', () => {
    expect(dashboardReducer(state, { type: 'selectPlayer', id: 'zzz', players: data })).toBe(state)
  })

  it('ignores a season the player lacks', () => {
    expect(dashboardReducer(state, { type: 'selectSeason', season: 2019, players: data })).toBe(
      state,
    )
  })

  it('changes to a season the player has', () => {
    expect(dashboardReducer(state, { type: 'selectSeason', season: 2024, players: data })).toEqual({
      selectedPlayerId: 'a',
      selectedSeason: 2024,
    })
  })
})

describe('useDashboardState', () => {
  it('exposes defaults, seasons and profile from the fixture', () => {
    const { result } = renderHook(() => useDashboardState(base))
    expect(result.current.selectedPlayerId).toBe(base[0].id)
    expect(result.current.selectedSeason).toBe(2025)
    expect(result.current.seasons).toEqual([2024, 2025])
    expect(result.current.profile).toBe(base[1])
  })

  it('updates profile and seasons on selection', () => {
    const data = [make('a', 2024), make('a', 2025), make('b', 2024)]
    const { result } = renderHook(() => useDashboardState(data))
    act(() => result.current.selectSeason(2024))
    expect(result.current.profile).toBe(data[0])
    act(() => result.current.selectPlayer('b'))
    expect(result.current.seasons).toEqual([2024])
    expect(result.current.selectedSeason).toBe(2024)
    expect(result.current.profile).toBe(data[2])
  })
})
