import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import fixture from './data/players.json'
import { playerProfilesSchema } from './data/schema'

const base = playerProfilesSchema.parse(fixture)

// Own file: a fresh module registry means the chart chunk has not been loaded yet.
describe('App lazy trend chart', () => {
  it('shows the trend skeleton first, then swaps in the chart with its aria-label', async () => {
    render(<App />)
    expect(screen.getByTestId('skeleton-trend')).toBeInTheDocument()
    expect(screen.queryByTestId('trend-card')).toBeNull()

    await screen.findByTestId('trend-card')
    expect(screen.queryByTestId('skeleton-trend')).toBeNull()
    const p2025 = base.find((p) => p.id === base[0].id && p.season === 2025)!
    expect(screen.getByTestId('trend-chart').getAttribute('aria-label')).toContain(
      p2025.trend.metricName,
    )
  })
})
