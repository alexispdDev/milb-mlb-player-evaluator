import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlayerSelector from './PlayerSelector'

const LONG = 'Bartholomew Rodriguez-Castellanos'
const players = [
  { id: 'a', fullName: 'Freddie Freeman' },
  { id: 'b', fullName: 'Mookie Betts' },
  { id: 'c', fullName: LONG },
]

function setup(selectedId = 'a') {
  const onSelect = vi.fn()
  function Host() {
    const [id, setId] = useState(selectedId)
    return (
      <PlayerSelector
        players={players}
        selectedId={id}
        onSelect={(next) => {
          onSelect(next)
          setId(next)
        }}
      />
    )
  }
  render(<Host />)
  const input = screen.getByRole('combobox', { name: 'Player' })
  return { input: input as HTMLInputElement, onSelect }
}

const optionTexts = () => screen.queryAllByRole('option').map((o) => o.textContent)

describe('PlayerSelector', () => {
  it('shows the selected name and a closed list initially', () => {
    const { input } = setup()
    expect(input).toBe(screen.getByTestId('player-selector-input'))
    expect(screen.getByTestId('player-selector')).toBeInTheDocument()
    expect(input.value).toBe('Freddie Freeman')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('filters case-insensitively and trimmed when typing', async () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'free' } })
    await waitFor(() => expect(optionTexts()).toEqual(['Freddie Freeman']))
    fireEvent.change(input, { target: { value: '  FREE ' } })
    await waitFor(() => expect(optionTexts()).toEqual(['Freddie Freeman']))
  })

  it('lists all players when opened without typing', async () => {
    const { input } = setup()
    {
      input.focus()
      fireEvent.click(input)
    }
    await waitFor(() => expect(optionTexts()).toEqual(players.map((p) => p.fullName)))
    expect(screen.getAllByTestId('player-selector-option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: 'Freddie Freeman' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('calls onSelect once when an option is clicked and closes', async () => {
    const { input, onSelect } = setup()
    {
      input.focus()
      fireEvent.click(input)
    }
    // Headless UI selects an option on mousedown, so simulate the full click.
    const option = await screen.findByRole('option', { name: 'Mookie Betts' })
    fireEvent.mouseDown(option)
    fireEvent.click(option)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('b')
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
    expect(input.value).toBe('Mookie Betts')
  })

  it('shows the raw query in the empty message', async () => {
    const { input, onSelect } = setup()
    fireEvent.change(input, { target: { value: ' zzz' } })
    const empty = await screen.findByTestId('player-selector-empty')
    expect(empty).toHaveTextContent("No player found matching ' zzz'")
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not select on Enter with no match', async () => {
    const { input, onSelect } = setup()
    fireEvent.change(input, { target: { value: 'zzz' } })
    await screen.findByTestId('player-selector-empty')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('restores the selected name on Escape after a no-match query', async () => {
    const { input, onSelect } = setup()
    fireEvent.change(input, { target: { value: 'zzz' } })
    await screen.findByTestId('player-selector-empty')
    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByTestId('player-selector-empty')).not.toBeInTheDocument(),
    )
    expect(input.value).toBe('Freddie Freeman')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('restores the selected name on blur after a no-match query', async () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'zzz' } })
    await screen.findByTestId('player-selector-empty')
    fireEvent.blur(input)
    await waitFor(() =>
      expect(screen.queryByTestId('player-selector-empty')).not.toBeInTheDocument(),
    )
    expect(input.value).toBe('Freddie Freeman')
    {
      input.focus()
      fireEvent.click(input)
    }
    await waitFor(() => expect(optionTexts()).toHaveLength(3))
  })

  it('opens with ArrowDown and selects the first option with Enter', async () => {
    const { input, onSelect } = setup()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    await waitFor(() => expect(optionTexts()).toHaveLength(3))
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('a')
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
  })

  it('moves the active option with arrows', async () => {
    const { input, onSelect } = setup()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    await waitFor(() => expect(optionTexts()).toHaveLength(3))
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('closes on Escape without selecting', async () => {
    const { input, onSelect } = setup()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    await waitFor(() => expect(optionTexts()).toHaveLength(3))
    fireEvent.keyDown(input, { key: 'Escape' })
    await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0))
    expect(onSelect).not.toHaveBeenCalled()
    expect(input.value).toBe('Freddie Freeman')
  })

  it('renders a 33-character name as option and in the input', async () => {
    expect(LONG).toHaveLength(33)
    const { input } = setup('c')
    expect(input.value).toBe(LONG)
    {
      input.focus()
      fireEvent.click(input)
    }
    expect(await screen.findByRole('option', { name: LONG })).toBeInTheDocument()
  })

  it('has focus-visible outline classes', () => {
    const { input } = setup()
    for (const c of [
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-below',
    ]) {
      expect(input.classList.contains(c)).toBe(true)
    }
  })
})
