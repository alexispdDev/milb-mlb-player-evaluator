import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type PlayerProfile } from '../data/schema'
import RollingTrendChartCard from './RollingTrendChartCard'

const profiles = playerProfilesSchema.parse(players)
const first = profiles[0]

type Trend = PlayerProfile['trend']

const planTrend: Trend = {
  metricName: 'Hard-Hit% Rolling (Last 50 PA)',
  points: [
    { pa: 50, value: 46.0 },
    { pa: 100, value: 47.5 },
    { pa: 200, value: 49.0 },
    { pa: 300, value: 50.2 },
    { pa: 400, value: 51.5 },
    { pa: 500, value: 50.0 },
    { pa: 580, value: 49.2 },
  ],
}

function renderCard(trend: Trend) {
  return render(
    <RollingTrendChartCard trend={trend} width={600} height={280} isAnimationActive={false} />,
  )
}

describe('RollingTrendChartCard', () => {
  it('renders card, header and accessible chart wrapper', () => {
    renderCard(planTrend)
    const card = screen.getByTestId('trend-card')
    expect(card).toHaveClass('bg-card', 'text-foreground')
    expect(screen.getByTestId('trend-header')).toHaveTextContent('Hard-Hit% Rolling (Last 50 PA)')
    expect(screen.getByTestId('trend-chart')).toHaveAttribute('role', 'img')
    expect(screen.getByTestId('trend-chart')).toHaveAttribute(
      'aria-label',
      'Hard-Hit% Rolling (Last 50 PA): rolling trend over plate appearances',
    )
  })

  it('renders one line and one dot per point, with X axis label', () => {
    const { container } = renderCard(planTrend)
    expect(container.querySelector('.recharts-line')).not.toBeNull()
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(7)
    expect(screen.getByText('Plate appearances')).toBeInTheDocument()
  })

  it('renders the first fixture player trend', () => {
    const { container } = renderCard(first.trend)
    expect(first.trend.points.length).toBeGreaterThanOrEqual(7)
    expect(first.trend.points.at(-1)!.pa).toBe(first.summary.plateAppearances)
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(first.trend.points.length)
  })

  it('shows the tooltip text on hover', async () => {
    const { container } = renderCard({
      metricName: 'M',
      points: [
        { pa: 100, value: 40 },
        { pa: 400, value: 51.5 },
      ],
    })
    const wrapper = container.querySelector('.recharts-wrapper')!
    // x=570 is inside the plot area (60..584 at width 600) and nearest the last point (pa 400).
    fireEvent.mouseEnter(wrapper, { clientX: 570, clientY: 100 })
    fireEvent.mouseMove(wrapper, { clientX: 570, clientY: 100 })
    const tip = await screen.findByTestId('trend-tooltip')
    expect(tip).toHaveTextContent('PA #400: 51.5%')
    expect(tip).toHaveClass('bg-card', 'text-foreground')
  })

  it('renders an empty state without a chart', () => {
    const { container } = renderCard({ metricName: 'Empty', points: [] })
    expect(screen.getByTestId('trend-header')).toHaveTextContent('Empty')
    expect(screen.getByTestId('trend-empty')).toHaveTextContent('No trend data')
    expect(screen.queryByTestId('trend-chart')).toBeNull()
    expect(container.querySelector('.recharts-wrapper')).toBeNull()
  })

  it('renders a single point', () => {
    const { container } = renderCard({
      metricName: 'One',
      points: [{ pa: 400, value: 51.5 }],
    })
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(1)
  })
})
