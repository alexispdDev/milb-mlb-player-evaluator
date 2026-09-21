import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { FOCUS_RING, PEER_FOCUS_RING } from './focusRing'
import PlayerSelector from './PlayerSelector'
import SeasonToggle from './SeasonToggle'
import LoadErrorBanner from './LoadErrorBanner'

const hasAll = (el: Element, constant: string) =>
  constant.split(' ').every((c) => el.classList.contains(c))

describe('focusRing', () => {
  it('exports the exact shared class strings', () => {
    expect(FOCUS_RING).toBe(
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-below',
    )
    expect(PEER_FOCUS_RING).toBe(
      'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-below',
    )
  })

  it('PlayerSelector input has every FOCUS_RING class', () => {
    render(
      createElement(PlayerSelector, {
        players: [{ id: 'a', fullName: 'A' }] as never,
        selectedId: 'a',
        onSelect: () => {},
      }),
    )
    expect(hasAll(screen.getByTestId('player-selector-input'), FOCUS_RING)).toBe(true)
  })

  it('SeasonToggle label has every PEER_FOCUS_RING class', () => {
    render(
      createElement(SeasonToggle, { seasons: [2024], selected: 2024, onSelect: () => {} }),
    )
    const label = screen.getByText('2024')
    expect(label.tagName).toBe('LABEL')
    expect(hasAll(label, PEER_FOCUS_RING)).toBe(true)
  })

  it('LoadErrorBanner reload button has every FOCUS_RING class', () => {
    render(createElement(LoadErrorBanner))
    expect(hasAll(screen.getByTestId('load-error-reload'), FOCUS_RING)).toBe(true)
  })
})
