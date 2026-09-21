import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

// PROXY for the "player switch under 100 ms" budget (frontend-plan 4.2).
// This measures jsdom time: React's synchronous re-render plus jsdom DOM
// work. It is NOT browser layout or paint, and does not replace the manual
// DevTools measurement described in _docs/performance.md.
const CEILING_MS = 100
const WARMUP = 5
const MEASURED = 20

const players = [
  'Bartholomew Rodriguez-Castellanos',
  'Nick Carver',
  'Marcus Bell',
  'Freddie Freeman',
]

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Opening the list is not timed; only the selection and its re-render are.
async function timedPlayerSwitch(name: string): Promise<number> {
  const input = screen.getByRole('combobox', { name: 'Player' })
  input.blur()
  input.focus()
  fireEvent.click(input)
  const option = await screen.findByRole('option', { name })
  const start = performance.now()
  fireEvent.mouseDown(option)
  fireEvent.click(option)
  const ms = performance.now() - start
  // Wait for the list to close (untimed) so the next switch starts clean.
  await waitFor(() => expect(screen.queryByRole('option')).toBeNull())
  // Guard against timing a no-op: the switch must really have happened.
  expect(screen.getByTestId('player-name')).toHaveTextContent(name)
  return ms
}

function timedSeasonSwitch(year: string): number {
  const radio = screen.getByRole('radio', { name: year })
  // The target must differ from the current season, or the click is a no-op.
  expect(radio).not.toBeChecked()
  const start = performance.now()
  fireEvent.click(radio)
  const ms = performance.now() - start
  // Guard against timing a no-op (asserted after the timing is captured).
  expect(radio).toBeChecked()
  return ms
}

describe('App performance', () => {
  it(`PROXY: median player/season switch in jsdom is under ${CEILING_MS} ms`, async () => {
    render(<App />)
    // The lazy chart chunk load is not part of the switch time.
    await screen.findByTestId('trend-card')
    const samples: number[] = []
    let year = 2025
    for (let i = 0; i < WARMUP + MEASURED; i++) {
      // Alternate a player switch with a season switch.
      const ms =
        i % 2 === 0
          ? await timedPlayerSwitch(players[(i / 2) % players.length])
          : timedSeasonSwitch(String((year = year === 2025 ? 2024 : 2025)))
      if (i >= WARMUP) samples.push(ms)
    }
    expect(samples).toHaveLength(MEASURED)
    const med = median(samples)
    console.info(
      `PROXY switch (jsdom): median ${med.toFixed(1)} ms, max ${Math.max(...samples).toFixed(1)} ms, n=${samples.length}`,
    )
    expect(med).toBeLessThan(CEILING_MS)
  })
})
