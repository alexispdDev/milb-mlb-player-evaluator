import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import App from './App'

// A throwing factory makes the dynamic import() in App.tsx reject, like a failed chunk download.
vi.mock('./components/RollingTrendChartCard', () => {
  throw new Error('chunk failed')
})

const options = {
  rules: {
    // jsdom has no layout/paint, so contrast cannot be computed here; real contrast is #21.
    'color-contrast': { enabled: false },
  },
}

const gaugeValues = () => screen.getAllByTestId('gauge-card-value').map((e) => e.textContent)

// Own file: the mock must not leak into tests that use the real lazy chart.
describe('App when the trend chart chunk fails to load', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the skeleton, then only the trend slot turns into the chart error banner', async () => {
    render(<App />)
    expect(screen.getByTestId('skeleton-trend')).toBeInTheDocument()

    const banner = await screen.findByTestId('chart-error-banner')
    expect(screen.queryByTestId('skeleton-trend')).toBeNull()
    expect(banner).toHaveAttribute('role', 'alert')
    expect(banner).toHaveTextContent('The trend chart could not be loaded.')
    expect(banner).toHaveTextContent('Reload the application to try again.')
    expect(within(banner).getByRole('button', { name: 'Reload Application' })).toHaveAttribute(
      'data-testid',
      'chart-error-reload',
    )
    expect(screen.queryByText('Player data could not be loaded.')).toBeNull()
    expect(screen.queryByTestId('load-error-banner')).toBeNull()
    expect(screen.queryByText(/chunk failed/)).toBeNull()

    expect(screen.getByTestId('app-brand')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Player' })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: 'Season' })).toBeInTheDocument()
    expect(screen.getByTestId('player-name')).toBeInTheDocument()
    expect(screen.getAllByTestId('gauge-card')).toHaveLength(8)
  })

  it('keeps the season toggle working while the banner stays visible', async () => {
    render(<App />)
    await screen.findByTestId('chart-error-banner')
    const before = gaugeValues()
    const ageBefore = screen.getByTestId('player-age').textContent
    fireEvent.click(screen.getByRole('radio', { name: '2024' }))
    expect(gaugeValues()).not.toEqual(before)
    expect(screen.getByTestId('player-age').textContent).not.toBe(ageBefore)
    expect(screen.getAllByTestId('gauge-card')).toHaveLength(8)
    expect(screen.getByTestId('chart-error-banner')).toBeInTheDocument()
  })

  it('has no axe violations in the chart error state', async () => {
    const { container } = render(<App />)
    await screen.findByTestId('chart-error-banner')
    expect(await axe(container, options)).toHaveNoViolations()
  })
})
