import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import App from './App'

const options = {
  rules: {
    // jsdom has no layout/paint, so contrast cannot be computed here; real contrast is #21.
    'color-contrast': { enabled: false },
    // The dashboard is rendered as a fragment inside a test container, not a full page,
    // so "all content in landmarks" is not meaningful for the container.
    region: { enabled: false },
  },
}

describe('App accessibility (axe)', () => {
  it('default profile has no violations', async () => {
    const { container } = render(<App />)
    expect(await axe(container, options)).toHaveNoViolations()
  })

  it('N/A profile (Nick Carver 2025) has no violations', async () => {
    const { container } = render(<App />)
    const input = screen.getByRole('combobox', { name: 'Player' })
    input.focus()
    fireEvent.click(input)
    const option = await screen.findByRole('option', { name: 'Nick Carver' })
    fireEvent.mouseDown(option)
    fireEvent.click(option)
    fireEvent.click(screen.getByRole('radio', { name: '2025' }))
    expect(
      screen.getByRole('group', {
        name: 'Maximum Exit Velocity: not available, League Average: 109.8 miles per hour',
      }),
    ).toBeInTheDocument()
    expect(await axe(container, options)).toHaveNoViolations()
  })

  it('load error banner has no violations', async () => {
    const { container } = render(
      <App loadResult={{ ok: false, error: { kind: 'empty', message: 'No players' } }} />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(await axe(container, options)).toHaveNoViolations()
  })

  it('loading skeletons have no violations', async () => {
    const { container } = render(<App loading />)
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(await axe(container, options)).toHaveNoViolations()
  })
})
