import { render, screen } from '@testing-library/react'
import TopNavigation from './TopNavigation'

describe('TopNavigation', () => {
  it('renders a header landmark with non-empty brand text', () => {
    render(<TopNavigation />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByTestId('app-brand')).not.toBeEmptyDOMElement()
  })

  it('renders empty placeholder slots for the player selector and season toggle', () => {
    render(<TopNavigation />)
    expect(screen.getByTestId('player-selector-slot')).toBeEmptyDOMElement()
    expect(screen.getByTestId('season-toggle-slot')).toBeEmptyDOMElement()
  })

  it('applies the header background token to the header element', () => {
    render(<TopNavigation />)
    expect(screen.getByRole('banner')).toHaveClass('bg-header')
  })
})
