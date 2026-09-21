import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TempSeasonSelect } from './TempDashboardControls'

describe('TempDashboardControls', () => {
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
