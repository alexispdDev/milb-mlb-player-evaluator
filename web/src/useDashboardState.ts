import { useCallback, useMemo, useReducer } from 'react'
import { getProfile, listPlayers } from './data/loadPlayers'
import type { PlayerProfile } from './data/schema'

export type DashboardState = {
  selectedPlayerId: string
  selectedSeason: number
}

export type DashboardAction =
  | { type: 'selectPlayer'; id: string; players: PlayerProfile[] }
  | { type: 'selectSeason'; season: number; players: PlayerProfile[] }

export function seasonsFor(players: PlayerProfile[], id: string): number[] {
  const seasons = new Set<number>()
  for (const p of players) if (p.id === id) seasons.add(p.season)
  return [...seasons].sort((a, b) => a - b)
}

export function initialDashboardState(
  players: PlayerProfile[],
): DashboardState {
  const first = listPlayers(players)[0]
  if (!first) return { selectedPlayerId: '', selectedSeason: 0 }
  const seasons = seasonsFor(players, first.id)
  return {
    selectedPlayerId: first.id,
    selectedSeason: seasons[seasons.length - 1],
  }
}

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'selectPlayer': {
      const seasons = seasonsFor(action.players, action.id)
      if (seasons.length === 0) return state
      const selectedSeason = seasons.includes(state.selectedSeason)
        ? state.selectedSeason
        : seasons[seasons.length - 1]
      if (
        action.id === state.selectedPlayerId &&
        selectedSeason === state.selectedSeason
      ) {
        return state
      }
      return { selectedPlayerId: action.id, selectedSeason }
    }
    case 'selectSeason': {
      if (
        action.season === state.selectedSeason ||
        !getProfile(action.players, state.selectedPlayerId, action.season)
      ) {
        return state
      }
      return { ...state, selectedSeason: action.season }
    }
  }
}

export function useDashboardState(players: PlayerProfile[]) {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    players,
    initialDashboardState,
  )
  const seasons = useMemo(
    () => seasonsFor(players, state.selectedPlayerId),
    [players, state.selectedPlayerId],
  )
  const profile = getProfile(
    players,
    state.selectedPlayerId,
    state.selectedSeason,
  )
  const selectPlayer = useCallback(
    (id: string) => dispatch({ type: 'selectPlayer', id, players }),
    [players],
  )
  const selectSeason = useCallback(
    (season: number) => dispatch({ type: 'selectSeason', season, players }),
    [players],
  )
  return {
    selectedPlayerId: state.selectedPlayerId,
    selectedSeason: state.selectedSeason,
    seasons,
    profile,
    selectPlayer,
    selectSeason,
  }
}
