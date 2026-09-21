import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type Metric } from '../data/schema'
import GaugeGrid from './GaugeGrid'

const profiles = playerProfilesSchema.parse(players)
const metrics = profiles[0].metrics

const titles = () => screen.getAllByTestId('gauge-card-title').map((el) => el.textContent)

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

  describe('N/A metrics from the fixture', () => {
    const profileFor = (name: string, season: number) =>
      profiles.find((p) => p.identity.fullName === name && p.season === season)!

    it('renders one N/A card for Nick Carver 2025 (max_ev)', () => {
      render(<GaugeGrid metrics={profileFor('Nick Carver', 2025).metrics} />)
      expect(screen.getAllByTestId('gauge-card')).toHaveLength(8)
      expect(screen.getAllByTestId('gauge-card-na')).toHaveLength(1)
      expect(screen.getAllByTestId('gauge-card-value')).toHaveLength(7)
      expect(screen.getAllByTestId('gauge-needle')).toHaveLength(7)
      const card = screen.getByTestId('gauge-card-na').closest('[data-testid="gauge-card"]')!
      expect(within(card as HTMLElement).getByTestId('gauge-card-title')).toHaveTextContent(
        'MAX EXIT VELO',
      )
      expect(within(card as HTMLElement).getByTestId('gauge-card-benchmark')).toHaveTextContent(
        'Avg: 109.8 MPH',
      )
    })

    it('renders no N/A card for Freddie Freeman 2024', () => {
      render(<GaugeGrid metrics={profileFor('Freddie Freeman', 2024).metrics} />)
      expect(screen.queryAllByTestId('gauge-card-na')).toHaveLength(0)
      expect(screen.getAllByTestId('gauge-card-value')).toHaveLength(8)
    })
  })
})

describe('GaugeGrid accessible labels', () => {
  it('exposes 8 labelled groups', () => {
    render(<GaugeGrid metrics={metrics} />)
    expect(screen.getAllByRole('group', { name: /League Average/ })).toHaveLength(8)
  })
})
