import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type Metric } from '../data/schema'
import StatcastGaugeCard from './StatcastGaugeCard'
import { GAUGE_CARD_MIN_HEIGHT, GAUGE_CARD_WRAPPER } from './skeletonDimensions'

const profiles = playerProfilesSchema.parse(players)
const freeman = profiles.find(
  (p) => p.identity.fullName === 'Freddie Freeman' && p.season === 2024,
)!

function fixture(id: string): Metric {
  const m = freeman.metrics.find((x) => x.id === id)
  if (!m) throw new Error(`metric not found: ${id}`)
  return m
}

const base: Metric = {
  id: 'x',
  name: 'X',
  unit: '%',
  value: 10,
  leagueAvg: 8.5,
  percentile: 50,
  inverted: false,
}

const stroke = () => screen.getByTestId('gauge-arc').getAttribute('stroke')

describe('StatcastGaugeCard', () => {
  it('renders shell, title, value and benchmark for Barrel%', () => {
    render(<StatcastGaugeCard metric={fixture('barrel_rate')} />)
    expect(screen.getByTestId('gauge-card')).toHaveClass('bg-card')
    const title = screen.getByTestId('gauge-card-title')
    expect(title).toHaveTextContent('BARREL%')
    expect(title).toHaveClass('text-foreground')
    expect(screen.getByTestId('gauge-card-value')).toHaveTextContent(/^12\.8%$/)
    expect(screen.getByTestId('gauge-card-value')).toHaveClass('text-foreground')
    expect(screen.getByTestId('gauge-card-benchmark')).toHaveTextContent(/^Avg: 8\.5%$/)
    expect(screen.getByTestId('gauge-card-benchmark')).toHaveClass('text-subtext')
    expect(screen.getByTestId('gauge')).toBeInTheDocument()
    expect(stroke()).toBe('var(--color-above)')
  })

  it('formats MPH and degree units', () => {
    const { unmount } = render(<StatcastGaugeCard metric={fixture('avg_ev')} />)
    expect(screen.getByTestId('gauge-card-value')).toHaveTextContent(/^91\.5 MPH$/)
    expect(screen.getByTestId('gauge-card-benchmark')).toHaveTextContent(
      /^Avg: 88\.9 MPH$/,
    )
    unmount()
    render(<StatcastGaugeCard metric={fixture('avg_la')} />)
    expect(screen.getByTestId('gauge-card-value')).toHaveTextContent(/^14\.2°$/)
    expect(screen.getByTestId('gauge-card-benchmark')).toHaveTextContent(/^Avg: 12\.3°$/)
  })

  it('shows integers with one decimal', () => {
    render(<StatcastGaugeCard metric={fixture('whiff_rate')} />)
    expect(screen.getByTestId('gauge-card-benchmark')).toHaveTextContent(/^Avg: 23\.0%$/)
    expect(stroke()).toBe('var(--color-above)')
  })

  it('colors below-average non-inverted blue', () => {
    render(<StatcastGaugeCard metric={{ ...base, value: 5 }} />)
    expect(stroke()).toBe('var(--color-below)')
  })

  it('colors above-average inverted blue', () => {
    render(
      <StatcastGaugeCard
        metric={{ ...base, value: 30, leagueAvg: 23, inverted: true }}
      />,
    )
    expect(stroke()).toBe('var(--color-below)')
  })

  it.each([false, true])('ties are blue (inverted=%s)', (inverted) => {
    render(<StatcastGaugeCard metric={{ ...base, value: 8.5, inverted }} />)
    expect(stroke()).toBe('var(--color-below)')
  })

  it('color ignores percentile', () => {
    render(<StatcastGaugeCard metric={{ ...base, value: 10, percentile: 30 }} />)
    expect(stroke()).toBe('var(--color-above)')
  })

  it('passes percentile to the gauge', () => {
    render(<StatcastGaugeCard metric={{ ...base, percentile: 50 }} />)
    expect(screen.getByTestId('gauge-needle')).toHaveAttribute(
      'transform',
      'rotate(90 100 100)',
    )
  })

  describe.each([
    ['value null only', { value: null }],
    ['percentile null only', { percentile: null }],
    ['both null', { value: null, percentile: null }],
  ])('N/A state: %s', (_, patch) => {
    const renderNa = () => render(<StatcastGaugeCard metric={{ ...base, ...patch }} />)

    it('renders the N/A card with grey track, no arc or needle', () => {
      renderNa()
      const card = screen.getByTestId('gauge-card')
      expect(card).toHaveClass(...GAUGE_CARD_WRAPPER.split(' '))
      expect(card).toHaveClass(GAUGE_CARD_MIN_HEIGHT)
      expect(screen.getByTestId('gauge-card-title')).toHaveTextContent('X')
      expect(screen.getByTestId('gauge')).toBeInTheDocument()
      expect(screen.getByTestId('gauge-track')).toBeInTheDocument()
      expect(screen.queryByTestId('gauge-arc')).not.toBeInTheDocument()
      expect(screen.queryByTestId('gauge-needle')).not.toBeInTheDocument()
      const na = screen.getByTestId('gauge-card-na')
      expect(na).toHaveTextContent(/^N\/A$/)
      expect(na).toHaveClass('text-subtext', 'font-bold')
      expect(na).not.toHaveClass('text-foreground')
      expect(screen.getByTestId('gauge-card-benchmark')).toHaveTextContent(/^Avg: 8\.5%$/)
    })

    it('shows no value and no null-derived text', () => {
      renderNa()
      expect(screen.queryByTestId('gauge-card-value')).not.toBeInTheDocument()
      const text = screen.getByTestId('gauge-card').textContent ?? ''
      expect(text).not.toMatch(/null|NaN|0\.0|10%|0%|0 MPH/)
    })

    it('uses no above/below colors', () => {
      renderNa()
      const card = screen.getByTestId('gauge-card')
      expect(card.className).not.toMatch(/above|below/)
      for (const el of card.querySelectorAll('*')) {
        for (const attr of ['stroke', 'fill']) {
          expect(el.getAttribute(attr) ?? '').not.toMatch(/color-(above|below)/)
        }
        expect(el.getAttribute('class') ?? '').not.toMatch(/above|below/)
      }
    })
  })

  it('a normal card has no N/A element', () => {
    render(<StatcastGaugeCard metric={base} />)
    expect(screen.queryByTestId('gauge-card-na')).not.toBeInTheDocument()
    expect(screen.getByTestId('gauge-card-value')).toBeInTheDocument()
    expect(screen.getByTestId('gauge-arc')).toBeInTheDocument()
    expect(screen.getByTestId('gauge-needle')).toBeInTheDocument()
  })

  it('truncates long names with a title attribute', () => {
    const name = 'A very long metric name '.repeat(8)
    render(<StatcastGaugeCard metric={{ ...base, name }} />)
    const title = screen.getByTestId('gauge-card-title')
    expect(title).toHaveClass('truncate')
    expect(title).toHaveAttribute('title', name)
  })
})

describe('StatcastGaugeCard accessible label', () => {
  it('exposes a named group for a normal metric', () => {
    render(<StatcastGaugeCard metric={fixture('barrel_rate')} />)
    expect(
      screen.getByRole('group', {
        name: 'Barrel Percentage: 12.8 percent, League Average: 8.5 percent',
      }),
    ).toBe(screen.getByTestId('gauge-card'))
  })

  it('exposes the N/A label and keeps the visible N/A text', () => {
    render(<StatcastGaugeCard metric={{ ...fixture('max_ev'), value: null, percentile: null }} />)
    expect(
      screen.getByRole('group', {
        name: 'Maximum Exit Velocity: not available, League Average: 109.6 miles per hour',
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('gauge-card-na')).toHaveTextContent('N/A')
  })
})
