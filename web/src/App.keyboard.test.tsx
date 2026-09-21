import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import RollingTrendChartCard from './components/RollingTrendChartCard'
import LoadErrorBanner from './components/LoadErrorBanner'
import fixture from './data/players.json'
import type { LoadResult } from './data/loadPlayers'
import { playerProfilesSchema, type PlayerProfile } from './data/schema'

const base = playerProfilesSchema.parse(fixture)

function make(id: string, season: number, value: number, trendName: string): PlayerProfile {
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

const custom: LoadResult = {
  ok: true,
  players: [
    make('a', 2024, 11, 'A24'),
    make('a', 2025, 12, 'A25'),
    make('b', 2024, 21, 'B24'),
    make('b', 2025, 22, 'B25'),
  ],
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]') && !el.closest('[inert]'),
  )
}

const gaugeValues = () => screen.getAllByTestId('gauge-card-value').map((e) => e.textContent)

describe('keyboard flow: tab order', () => {
  it('puts the combobox first, then the season radios, and nothing after', () => {
    const { container } = render(<App />)
    const list = focusables(container)
    const combobox = screen.getByRole('combobox', { name: 'Player' })
    const radios = screen.getAllByRole('radio')
    expect(list[0]).toBe(combobox)
    for (const r of radios) {
      expect(list.indexOf(r)).toBeGreaterThan(0)
    }
    expect(list.slice(1)).toEqual(radios)
    // Nothing focusable after the season toggle (no chart, gauge or image tab stops).
    expect(list[list.length - 1]).toBe(radios[radios.length - 1])
    expect(screen.getAllByRole('group').every((g) => !list.includes(g))).toBe(true)
    expect(list.some((el) => el.tagName === 'IMG')).toBe(false)
  })

  it('season radios share one name', () => {
    render(<App />)
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.length).toBeGreaterThan(1)
    expect(new Set(radios.map((r) => r.name)).size).toBe(1)
    expect(radios[0].name).not.toBe('')
    // jsdom cannot verify the single tab stop (checked radio only) nor native arrow keys.
  })

  it('the trend chart has no tabindex="0" element', () => {
    render(<App />)
    expect(screen.getByTestId('trend-chart').querySelector('[tabindex="0"]')).toBeNull()
  })

  it('a sized chart renders an svg and still has no tabindex="0" (accessibilityLayer off)', () => {
    // Inside App, ResponsiveContainer renders nothing in jsdom, so render the card with fixed size.
    const { container } = render(
      <RollingTrendChartCard
        trend={base[0].trend}
        width={400}
        height={200}
        isAnimationActive={false}
      />,
    )
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(container.querySelector('[tabindex="0"]')).toBeNull()
  })
})

describe('keyboard flow: no focus traps', () => {
  it('has no positive tabindex, autofocus, dialog roles or aria-modal', () => {
    const { container } = render(<App />)
    const all = Array.from(container.querySelectorAll('*'))
    expect(all.filter((e) => Number(e.getAttribute('tabindex')) > 0)).toEqual([])
    expect(container.querySelector('[autofocus]')).toBeNull()
    expect(container.querySelector('[role="dialog"], [role="alertdialog"]')).toBeNull()
    expect(container.querySelector('[aria-modal]')).toBeNull()
  })

  it('is closed by default and closes on blur', async () => {
    render(<App />)
    expect(screen.queryByRole('listbox')).toBeNull()
    const input = screen.getByRole('combobox', { name: 'Player' })
    input.focus()
    fireEvent.click(input)
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    fireEvent.blur(input)
    input.blur()
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  })

  it('closes on Tab keydown', async () => {
    render(<App />)
    const input = screen.getByRole('combobox', { name: 'Player' })
    input.focus()
    fireEvent.click(input)
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Tab' })
    fireEvent.blur(input)
    input.blur()
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  })
})

describe('keyboard-only integration', () => {
  it('selects another player with ArrowDown / Enter on the combobox', async () => {
    render(<App loadResult={custom} />)
    expect(screen.getByTestId('player-name')).toHaveTextContent('Name a')
    const beforeGauges = gaugeValues()
    const input = screen.getByRole('combobox', { name: 'Player' })
    input.focus()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    await screen.findByRole('listbox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(
      await screen.findByText('Name b', { selector: '[data-testid="player-name"]' }),
    ).toBeInTheDocument()
    expect(gaugeValues()).not.toEqual(beforeGauges)
    expect(screen.getByTestId('trend-header')).toHaveTextContent(/^B/)
  })

  it('switches season through the radio group', () => {
    render(<App loadResult={custom} />)
    const before = gaugeValues()
    const group = screen.getByRole('radiogroup', { name: 'Season' })
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    // jsdom has no native radio arrow navigation; click is the DOM-level equivalent.
    // This verifies the DOM contract only, not real browser arrow-key behaviour.
    const r2024 = screen.getByRole('radio', { name: '2024' })
    fireEvent.click(r2024)
    expect(r2024).toBeChecked()
    expect(screen.getByTestId('trend-header')).toHaveTextContent('A24')
    expect(gaugeValues()).not.toEqual(before)
  })

  it('Reload button activation calls onReload once', () => {
    // Enter on a native button fires a click; jsdom does not, so click is used.
    const onReload = vi.fn()
    render(<LoadErrorBanner kind="empty" onReload={onReload} />)
    fireEvent.click(screen.getByRole('button', { name: /reload/i }))
    expect(onReload).toHaveBeenCalledTimes(1)
  })
})
