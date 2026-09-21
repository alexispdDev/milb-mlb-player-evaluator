import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SeasonToggle from './SeasonToggle'

// jsdom limits: it does not implement arrow-key movement between native
// radios, and it cannot show the visible focus ring (peer-focus-visible).
// These tests therefore assert the DOM contract only: one shared `name`, one
// checked radio, no tabindex="-1", and click/change firing `onSelect`.
// Arrow-key behaviour is provided by real browsers for native radio groups
// and the focus ring is checked manually in a browser.

function setup(seasons: number[], selected: number) {
  const onSelect = vi.fn()
  render(
    <SeasonToggle seasons={seasons} selected={selected} onSelect={onSelect} />,
  )
  return onSelect
}

describe('SeasonToggle', () => {
  it('renders a radiogroup named Season', () => {
    setup([2024, 2025], 2025)
    expect(screen.getByRole('radiogroup', { name: 'Season' })).toBe(
      screen.getByTestId('season-toggle'),
    )
  })

  it('renders radios in order sharing one name', () => {
    setup([2024, 2025], 2025)
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios.map((r) => r.value)).toEqual(['2024', '2025'])
    expect(new Set(radios.map((r) => r.name)).size).toBe(1)
    expect(radios[0].name).not.toBe('')
  })

  it('checks only the selected season', () => {
    setup([2024, 2025], 2025)
    expect(screen.getByRole('radio', { name: '2025' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '2024' })).not.toBeChecked()
  })

  it('has the testids', () => {
    setup([2024, 2025], 2025)
    expect(screen.getByTestId('season-option-2024')).toBeInTheDocument()
    expect(screen.getByTestId('season-option-2025')).toBeInTheDocument()
  })

  it('calls onSelect with the numeric season on click', () => {
    const onSelect = setup([2024, 2025], 2025)
    fireEvent.click(screen.getByRole('radio', { name: '2024' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(2024)
  })

  it('also fires when the visible label is clicked', () => {
    const onSelect = setup([2024, 2025], 2025)
    fireEvent.click(screen.getByText('2024'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(2024)
  })

  it('does not call onSelect when the selected option is clicked', () => {
    const onSelect = setup([2024, 2025], 2025)
    fireEvent.click(screen.getByRole('radio', { name: '2025' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders a single season checked', () => {
    const onSelect = setup([2024], 2024)
    const group = screen.getByRole('radiogroup', { name: 'Season' })
    expect(group.querySelectorAll('input')).toHaveLength(1)
    expect(screen.getByRole('radio', { name: '2024' })).toBeChecked()
    fireEvent.click(screen.getByRole('radio', { name: '2024' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders an empty group for zero seasons', () => {
    const onSelect = setup([], 2025)
    expect(screen.getByRole('radiogroup', { name: 'Season' })).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('checks nothing when selected is not in seasons', () => {
    setup([2024, 2025], 2023)
    for (const r of screen.getAllByRole('radio')) expect(r).not.toBeChecked()
  })

  it('keeps radios in the tab order', () => {
    setup([2024, 2025], 2025)
    for (const r of screen.getAllByRole('radio')) {
      expect(r).not.toHaveAttribute('tabindex', '-1')
    }
  })

  it('uses sr-only inputs before peer labels with the focus ring', () => {
    setup([2024, 2025], 2025)
    const input = screen.getByTestId('season-option-2024')
    expect(input).toHaveClass('sr-only', 'peer')
    const label = input.nextElementSibling as HTMLElement
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveClass(
      'peer-focus-visible:outline-2',
      'peer-focus-visible:outline-offset-2',
      'peer-focus-visible:outline-below',
    )
  })
})
