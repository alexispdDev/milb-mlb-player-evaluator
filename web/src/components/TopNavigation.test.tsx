import { render, screen } from '@testing-library/react'
import TopNavigation from './TopNavigation'

describe('TopNavigation', () => {
  it('renders a header landmark with non-empty brand text', () => {
    render(<TopNavigation />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('app-brand')).not.toBeEmptyDOMElement()
  })

  it('renders empty slots when no props are given', () => {
    render(<TopNavigation />)
    expect(screen.getByTestId('player-selector-slot')).toBeEmptyDOMElement()
    expect(screen.getByTestId('season-toggle-slot')).toBeEmptyDOMElement()
  })

  it('renders supplied nodes inside their slots', () => {
    render(
      <TopNavigation
        playerSelector={<span data-testid="p">P</span>}
        seasonToggle={<span data-testid="s">S</span>}
      />,
    )
    expect(screen.getByTestId('player-selector-slot')).toContainElement(
      screen.getByTestId('p'),
    )
    expect(screen.getByTestId('season-toggle-slot')).toContainElement(
      screen.getByTestId('s'),
    )
  })

  it('applies the header background token to the header element', () => {
    render(<TopNavigation />)
    expect(screen.getByRole('banner')).toHaveClass('bg-header')
  })
})
