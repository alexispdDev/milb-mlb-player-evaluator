import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChartErrorBoundary from './ChartErrorBoundary'

function Boom(): never {
  throw new Error('chunk failed')
}

describe('ChartErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the chart fallback when a child throws, without the raw message', () => {
    render(
      <ChartErrorBoundary>
        <Boom />
      </ChartErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('chart-error-banner')).toHaveTextContent(
      'The trend chart could not be loaded.',
    )
    expect(screen.getByRole('button', { name: 'Reload Application' })).toBeInTheDocument()
    expect(screen.queryByTestId('load-error-banner')).toBeNull()
    expect(screen.queryByText(/chunk failed/)).toBeNull()
  })

  it('renders healthy children with no fallback', () => {
    render(
      <ChartErrorBoundary>
        <p>fine</p>
      </ChartErrorBoundary>,
    )
    expect(screen.getByText('fine')).toBeInTheDocument()
    expect(screen.queryByTestId('chart-error-banner')).toBeNull()
  })

  it('calls the injected onReload once when Reload is clicked', () => {
    const onReload = vi.fn()
    render(
      <ChartErrorBoundary onReload={onReload}>
        <Boom />
      </ChartErrorBoundary>,
    )
    fireEvent.click(screen.getByTestId('chart-error-reload'))
    expect(onReload).toHaveBeenCalledTimes(1)
  })
})
