import { render, screen } from '@testing-library/react'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  it('renders header, main and background wrapper with no props', () => {
    const { container } = render(<DashboardLayout />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-background')
  })

  it('renders identity, gauges and trend inside main, in order', () => {
    render(
      <DashboardLayout
        identity={<div data-testid="i" />}
        gauges={<div data-testid="g" />}
        trend={<div data-testid="t" />}
      />,
    )
    const main = screen.getByRole('main')
    const ids = Array.from(main.querySelectorAll('[data-testid]')).map((el) =>
      el.getAttribute('data-testid'),
    )
    expect(ids).toEqual(['i', 'g', 't'])
  })

  it('renders nav nodes inside the selector and toggle slots', () => {
    render(
      <DashboardLayout
        playerSelector={<span data-testid="p" />}
        seasonToggle={<span data-testid="s" />}
      />,
    )
    expect(screen.getByTestId('player-selector-slot')).toContainElement(
      screen.getByTestId('p'),
    )
    expect(screen.getByTestId('season-toggle-slot')).toContainElement(
      screen.getByTestId('s'),
    )
  })
})
