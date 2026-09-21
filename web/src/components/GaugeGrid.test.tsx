import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type Metric } from '../data/schema'
import GaugeGrid from './GaugeGrid'

const profiles = playerProfilesSchema.parse(players)
const metrics = profiles[0].metrics

const titles = () =>
  screen.getAllByTestId('gauge-card-title').map((el) => el.textContent)

describe('GaugeGrid', () => {
  it('renders 8 cards for the first player', () => {
    expect(metrics).toHaveLength(8)
    render(<GaugeGrid metrics={metrics} />)
    expect(screen.getAllByTestId('gauge-card')).toHaveLength(8)
  })

  it('renders titles in FR-03 order from the fixture', () => {
    render(<GaugeGrid metrics={metrics} />)
    expect(titles()).toEqual(metrics.map((m) => m.name))
    expect(titles()).toEqual([
      'BARREL%',
      'HARD-HIT%',
      'EXIT VELOCITY (AVG)',
      'LAUNCH ANGLE (AVG)',
      'SWEET SPOT%',
      'MAX EXIT VELO',
      'WHIFF%',
      'CHASE%',
    ])
  })

  it('preserves the given order (no sorting)', () => {
    const reversed = [...metrics].reverse()
    render(<GaugeGrid metrics={reversed} />)
    expect(titles()).toEqual(reversed.map((m) => m.name))
  })

  it('has responsive grid classes', () => {
    render(<GaugeGrid metrics={metrics} />)
    expect(screen.getByTestId('gauge-grid')).toHaveClass(
      'grid',
      'grid-cols-2',
      'min-[1024px]:grid-cols-4',
      'gap-4',
    )
  })

  it('renders an empty container for 0 metrics', () => {
    render(<GaugeGrid metrics={[]} />)
    expect(screen.getByTestId('gauge-grid')).toBeEmptyDOMElement()
  })

  it('renders exactly 3 cards for 3 metrics', () => {
    render(<GaugeGrid metrics={metrics.slice(0, 3)} />)
    expect(screen.getAllByTestId('gauge-card')).toHaveLength(3)
  })

  it('renders all 9 cards for 9 metrics', () => {
    const extra: Metric = { ...metrics[0], id: 'extra', name: 'EXTRA' }
    render(<GaugeGrid metrics={[...metrics, extra]} />)
    expect(screen.getAllByTestId('gauge-card')).toHaveLength(9)
  })

  it('is a labelled region', () => {
    render(<GaugeGrid metrics={metrics} />)
    expect(screen.getByRole('region', { name: 'Statcast metrics' })).toBe(
      screen.getByTestId('gauge-grid'),
    )
  })
})
