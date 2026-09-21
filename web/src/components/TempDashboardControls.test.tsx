import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TempPlayerSelect, TempSeasonSelect } from './TempDashboardControls'

describe('TempDashboardControls', () => {
  it('renders labelled player select and reports changes', () => {
    const onSelect = vi.fn()
    render(
      <TempPlayerSelect
        players={[
          { id: 'a', fullName: 'Ann A' },
          { id: 'b', fullName: 'Bob B' },
        ]}
        selectedPlayerId="a"
        onSelectPlayer={onSelect}
      />,
    )
    const select = screen.getByLabelText('Player')
    expect(select).toBe(screen.getByTestId('temp-player-select'))
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Ann A',
      'Bob B',
    ])
    fireEvent.change(select, { target: { value: 'b' } })
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('renders labelled season select and reports numeric changes', () => {
    const onSelect = vi.fn()
    render(
      <TempSeasonSelect
        seasons={[2024, 2025]}
        selectedSeason={2025}
        onSelectSeason={onSelect}
      />,
    )
    const select = screen.getByLabelText('Season') as HTMLSelectElement
    expect(select.value).toBe('2025')
    fireEvent.change(select, { target: { value: '2024' } })
    expect(onSelect).toHaveBeenCalledWith(2024)
  })
})
