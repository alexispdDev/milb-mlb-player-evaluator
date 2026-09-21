import { render, screen } from '@testing-library/react'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  it('renders the top navigation header and a main content area', () => {
    render(<DashboardLayout />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the three placeholder regions inside main, in order', () => {
    render(<DashboardLayout />)
    const main = screen.getByRole('main')
    const testIds = Array.from(main.querySelectorAll('[data-testid]')).map(
      (el) => el.getAttribute('data-testid'),
    )
    expect(testIds).toEqual([
      'identity-card-placeholder',
      'gauge-grid-placeholder',
      'trend-chart-placeholder',
    ])
  })

  it('applies the background token to the outer wrapper', () => {
    const { container } = render(<DashboardLayout />)
    expect(container.firstChild).toHaveClass('bg-background')
  })
})
