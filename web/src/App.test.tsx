import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the portal heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'MLB Hitter Analytics Portal' }),
    ).toBeInTheDocument()
  })
})
