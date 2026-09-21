import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import fixture from './data/players.json'
import type { LoadResult } from './data/loadPlayers'
import { playerProfilesSchema, type PlayerProfile } from './data/schema'

const base = playerProfilesSchema.parse(fixture)

function make(
  id: string,
  season: number,
  value: number,
  trendName: string,
): PlayerProfile {
  const src = base[0]
  return {
    ...src,
    id,
    season,
    identity: { ...src.identity, fullName: `Name ${id}` },
    metrics: src.metrics.map((m) => ({ ...m, value })),
    trend: { ...src.trend, metricName: trendName },
  }
}

const ok = (players: PlayerProfile[]): LoadResult => ({ ok: true, players })

const chartLabel = () =>
  screen.getByTestId('trend-chart').getAttribute('aria-label')

const custom = [
  make('a', 2024, 11, 'A24'),
  make('a', 2025, 12, 'A25'),
  make('b', 2024, 21, 'B24'),
  make('b', 2025, 22, 'B25'),
  make('c', 2024, 31, 'C24'),
]

describe('App', () => {
  it('shows Freddie Freeman 2025 from the bundled fixture on load', () => {
    render(<App />)
    expect(screen.getByTestId('player-name')).toHaveTextContent('Freddie Freeman')
    expect(screen.getByLabelText('Season')).toHaveValue('2025')
    expect(screen.getByTestId('gauge-grid')).toBeInTheDocument()
    const p2025 = base.find((p) => p.id === base[0].id && p.season === 2025)!
    expect(screen.getByTestId('trend-header')).toHaveTextContent(
      p2025.trend.metricName,
    )
  })

  it('lists every player once and the selected player\'s seasons', () => {
    render(<App />)
    const names = Array.from(
      screen.getByLabelText('Player').querySelectorAll('option'),
    ).map((o) => o.textContent)
    const expected = [...new Set(base.map((p) => p.identity.fullName))]
    expect(names).toEqual(expected)
    const seasons = Array.from(
      screen.getByLabelText('Season').querySelectorAll('option'),
    ).map((o) => o.textContent)
    expect(seasons).toEqual(['2024', '2025'])
  })

  it('updates identity, gauges and trend when the player changes', () => {
    render(<App loadResult={ok(custom)} />)
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    const before = screen.getAllByTestId('gauge-card-value')[0].textContent
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: 'b' } })
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name b')
    expect(screen.getAllByTestId('gauge-card-value')[0].textContent).not.toBe(
      before,
    )
    expect(chartLabel()).toContain('B25')
    expect(screen.getByTestId('trend-header')).toHaveTextContent('B25')
  })

  it('updates the same sections when the season changes', () => {
    render(<App loadResult={ok(custom)} />)
    expect(chartLabel()).toContain('A25')
    fireEvent.change(screen.getByLabelText('Season'), {
      target: { value: '2024' },
    })
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    expect(chartLabel()).toContain('A24')
    expect(screen.getAllByTestId('gauge-card-value')[0]).toHaveTextContent('11')
  })

  it('keeps the selected season when switching to a player who has it', () => {
    render(<App loadResult={ok(custom)} />)
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: 'b' } })
    expect(screen.getByLabelText('Season')).toHaveValue('2025')
  })

  it('falls back to the latest season for a player lacking the season', () => {
    render(<App loadResult={ok(custom)} />)
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: 'c' } })
    expect(screen.getByLabelText('Season')).toHaveValue('2024')
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name c')
    expect(chartLabel()).toContain('C24')
    expect(screen.getAllByTestId('gauge-card-value')[0]).toHaveTextContent('31')
  })

  it('lists only the single season of a single-season player', () => {
    render(<App loadResult={ok(custom)} />)
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: 'c' } })
    const seasons = Array.from(
      screen.getByLabelText('Season').querySelectorAll('option'),
    ).map((o) => o.textContent)
    expect(seasons).toEqual(['2024'])
  })

  it('defaults to the first player and that player\'s own latest season', () => {
    render(
      <App
        loadResult={ok([make('a', 2024, 1, 'A24'), make('b', 2025, 2, 'B25')])}
      />,
    )
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    expect(screen.getByLabelText('Season')).toHaveValue('2024')
  })

  it('shows only the error placeholder when loading failed', () => {
    render(
      <App
        loadResult={{
          ok: false,
          error: { kind: 'empty', message: 'Player data contains no players.' },
        }}
      />,
    )
    expect(screen.getByTestId('load-error-placeholder')).toHaveTextContent(
      'Unable to load player data.',
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByTestId('gauge-grid')).not.toBeInTheDocument()
    expect(screen.queryByTestId('identity-card')).not.toBeInTheDocument()
    expect(screen.queryByTestId('trend-card')).not.toBeInTheDocument()
  })
})
