import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LoadErrorBanner from './LoadErrorBanner'

const sentences = {
  'invalid-schema': 'The player data file is not in the expected format.',
  'duplicate-profile': 'The player data contains the same player and season more than once.',
  empty: 'The player data file contains no players.',
} as const

describe('LoadErrorBanner', () => {
  const original = window.location
  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: original,
    })
  })

  it('is an alert with the heading', () => {
    render(<LoadErrorBanner />)
    const banner = screen.getByTestId('load-error-banner')
    expect(banner).toHaveAttribute('role', 'alert')
    expect(banner).toHaveTextContent('Player data could not be loaded.')
  })

  it.each(Object.entries(sentences))('maps kind %s to its sentence', (kind, s) => {
    render(<LoadErrorBanner kind={kind as keyof typeof sentences} />)
    expect(screen.getByTestId('load-error-banner')).toHaveTextContent(s)
  })

  it('shows the generic sentence when kind is omitted', () => {
    render(<LoadErrorBanner />)
    expect(screen.getByTestId('load-error-banner')).toHaveTextContent(
      'Something went wrong while preparing the dashboard.',
    )
  })

  it('has a real Reload Application button that calls onReload once', () => {
    const onReload = vi.fn()
    render(<LoadErrorBanner onReload={onReload} />)
    const button = screen.getByRole('button', { name: 'Reload Application' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-testid', 'load-error-reload')
    fireEvent.click(button)
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it('reloads the window when onReload is not passed', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    })
    render(<LoadErrorBanner />)
    fireEvent.click(screen.getByTestId('load-error-reload'))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('uses the red tokens and focus classes, no hex colours', () => {
    render(<LoadErrorBanner />)
    const banner = screen.getByTestId('load-error-banner')
    expect(banner).toHaveClass('border-above', 'bg-card')
    expect(banner.className).toMatch(/text-above(-strong)?\b/)
    const button = screen.getByTestId('load-error-reload')
    expect(button).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-below',
    )
    expect(banner.outerHTML).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  describe('chart variant', () => {
    it('shows the chart heading, sentence, testids and role', () => {
      render(<LoadErrorBanner variant="chart" />)
      const banner = screen.getByTestId('chart-error-banner')
      expect(banner).toHaveAttribute('role', 'alert')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'The trend chart could not be loaded.',
      )
      expect(banner).toHaveTextContent('Reload the application to try again.')
      expect(banner).toHaveClass('border-above', 'bg-card', 'text-above-text')
      expect(screen.queryByTestId('load-error-banner')).toBeNull()
      expect(screen.queryByText('Player data could not be loaded.')).toBeNull()
    })

    it('ignores kind', () => {
      render(<LoadErrorBanner variant="chart" kind="empty" />)
      expect(screen.getByTestId('chart-error-banner')).not.toHaveTextContent(sentences.empty)
    })

    it('has a real Reload button that calls onReload once', () => {
      const onReload = vi.fn()
      render(<LoadErrorBanner variant="chart" onReload={onReload} />)
      const button = screen.getByRole('button', { name: 'Reload Application' })
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('data-testid', 'chart-error-reload')
      expect(button).toHaveClass('text-above-text', 'focus-visible:outline-2')
      fireEvent.click(button)
      expect(onReload).toHaveBeenCalledTimes(1)
    })
  })
})
