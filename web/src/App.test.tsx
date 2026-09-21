import { fireEvent, render, screen, within } from '@testing-library/react'
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

function openList() {
  const input = screen.getByRole('combobox', { name: 'Player' })
  input.focus()
  fireEvent.click(input)
}

async function choosePlayer(name: string) {
  openList()
  // Headless UI selects an option on mousedown, so simulate the full click.
  const option = await screen.findByRole('option', { name })
  fireEvent.mouseDown(option)
  fireEvent.click(option)
}

const chartLabel = () =>
  screen.getByTestId('trend-chart').getAttribute('aria-label')

const custom = [
  make('a', 2024, 11, 'A24'),
  make('a', 2025, 12, 'A25'),
  make('b', 2024, 21, 'B24'),
  make('b', 2025, 22, 'B25'),
  make('c', 2024, 31, 'C24'),
]

const seasonGroup = () => screen.getByRole('radiogroup', { name: 'Season' })
const seasonRadio = (year: string) => screen.getByRole('radio', { name: year })

describe('App', () => {
  it('shows Freddie Freeman 2025 from the bundled fixture on load', () => {
    render(<App />)
    expect(screen.getByTestId('player-name')).toHaveTextContent('Freddie Freeman')
    expect(seasonRadio('2025')).toBeChecked()
    expect(screen.getByTestId('gauge-grid')).toBeInTheDocument()
    const p2025 = base.find((p) => p.id === base[0].id && p.season === 2025)!
    expect(screen.getByTestId('trend-header')).toHaveTextContent(
      p2025.trend.metricName,
    )
  })

  it('lists every player once and the selected player\'s seasons', async () => {
    render(<App />)
    openList()
    await screen.findAllByRole('option')
    const names = within(screen.getByTestId('player-selector'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    const expected = [...new Set(base.map((p) => p.identity.fullName))]
    expect(names).toEqual(expected)
    // The open combobox marks the rest of the page inert, hence hidden: true.
    const seasons = within(
      screen.getByRole('radiogroup', { name: 'Season', hidden: true }),
    )
      .getAllByRole('radio', { hidden: true })
      .map((r) => (r as HTMLInputElement).value)
    expect(seasons).toEqual(['2024', '2025'])
  })

  it('updates identity, gauges and trend when the player changes', async () => {
    render(<App loadResult={ok(custom)} />)
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    const before = screen.getAllByTestId('gauge-card-value')[0].textContent
    await choosePlayer('Name b')
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
    fireEvent.click(seasonRadio('2024'))
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    expect(chartLabel()).toContain('A24')
    expect(screen.getAllByTestId('gauge-card-value')[0]).toHaveTextContent('11')
  })

  it('keeps the selected season when switching to a player who has it', async () => {
    render(<App loadResult={ok(custom)} />)
    await choosePlayer('Name b')
    expect(seasonRadio('2025')).toBeChecked()
  })

  it('falls back to the latest season for a player lacking the season', async () => {
    render(<App loadResult={ok(custom)} />)
    await choosePlayer('Name c')
    expect(seasonRadio('2024')).toBeChecked()
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name c')
    expect(chartLabel()).toContain('C24')
    expect(screen.getAllByTestId('gauge-card-value')[0]).toHaveTextContent('31')
  })

  it('lists only the single season of a single-season player', async () => {
    render(<App loadResult={ok(custom)} />)
    await choosePlayer('Name c')
    const seasons = within(seasonGroup())
      .getAllByRole('radio')
      .map((r) => (r as HTMLInputElement).value)
    expect(seasons).toEqual(['2024'])
  })

  it('defaults to the first player and that player\'s own latest season', () => {
    render(
      <App
        loadResult={ok([make('a', 2024, 1, 'A24'), make('b', 2025, 2, 'B25')])}
      />,
    )
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    expect(seasonRadio('2024')).toBeChecked()
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
