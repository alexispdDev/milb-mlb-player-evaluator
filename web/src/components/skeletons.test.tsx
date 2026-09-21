import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GaugeGrid from './GaugeGrid'
import GaugeGridSkeleton from './GaugeGridSkeleton'
import IdentityCardSkeleton from './IdentityCardSkeleton'
import PlayerIdentityCard from './PlayerIdentityCard'
import RollingTrendChartCard from './RollingTrendChartCard'
import TrendChartSkeleton from './TrendChartSkeleton'
import fixture from '../data/players.json'
import { playerProfilesSchema } from '../data/schema'
import * as dims from './skeletonDimensions'

const profile = playerProfilesSchema.parse(fixture)[0]

function pulseBlocks(root: HTMLElement) {
  return Array.from(root.querySelectorAll('[aria-hidden="true"]')).filter((el) =>
    el.className.includes('bg-header'),
  )
}

describe('skeletons', () => {
  it('identity skeleton is busy, shares real root classes, has no text', () => {
    render(<IdentityCardSkeleton />)
    const sk = screen.getByTestId('skeleton-identity')
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(sk.textContent).toBe('')
    expect(sk.className).toContain(dims.IDENTITY_CARD_MIN_HEIGHT)
    expect(sk.className).toContain(dims.IDENTITY_CARD_WRAPPER)
    render(<PlayerIdentityCard profile={profile} />)
    const real = screen.getByTestId('identity-card')
    expect(real.className).toContain(dims.IDENTITY_CARD_MIN_HEIGHT)
    expect(real.className).toContain(dims.IDENTITY_CARD_WRAPPER)
    pulseBlocks(sk).forEach((b) => expect(b.className).toContain('motion-safe:animate-pulse'))
  })

  it('gauge grid skeleton has 8 cards and the real grid classes', () => {
    render(<GaugeGridSkeleton />)
    const sk = screen.getByTestId('skeleton-gauge-grid')
    expect(sk.tagName).toBe('SECTION')
    expect(sk).toHaveAttribute('aria-label', 'Statcast metrics')
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(screen.getAllByTestId('skeleton-gauge-card').length).toBe(8)
    expect(sk.textContent).toBe('')
    expect(sk.className).toContain(dims.GAUGE_GRID_CLASSES)
    expect(dims.GAUGE_GRID_CLASSES).toContain('grid-cols-2')
    expect(dims.GAUGE_GRID_CLASSES).toContain('min-[1024px]:grid-cols-4')
    const card = screen.getAllByTestId('skeleton-gauge-card')[0]
    expect(card.className).toContain(dims.GAUGE_CARD_MIN_HEIGHT)
    expect(card.className).toContain(dims.GAUGE_CARD_WRAPPER)
    expect(pulseBlocks(card).length).toBeGreaterThan(0)
    pulseBlocks(card).forEach((b) => expect(b.className).toContain('motion-safe:animate-pulse'))
  })

  it('real gauge grid and card use the shared constants', () => {
    render(<GaugeGrid metrics={profile.metrics} />)
    expect(screen.getByTestId('gauge-grid').className).toContain(dims.GAUGE_GRID_CLASSES)
    const card = screen.getAllByTestId('gauge-card')[0]
    expect(card.className).toContain(dims.GAUGE_CARD_MIN_HEIGHT)
    expect(card.className).toContain(dims.GAUGE_CARD_WRAPPER)
  })

  it('trend skeleton shares real root classes', () => {
    render(<TrendChartSkeleton />)
    const sk = screen.getByTestId('skeleton-trend')
    expect(sk).toHaveAttribute('aria-busy', 'true')
    expect(sk.textContent).toBe('')
    expect(sk.className).toContain(dims.TREND_CARD_MIN_HEIGHT)
    expect(sk.className).toContain(dims.TREND_CARD_WRAPPER)
    expect(sk.innerHTML).toContain(dims.CHART_HEIGHT_CLASS)
    pulseBlocks(sk).forEach((b) => expect(b.className).toContain('motion-safe:animate-pulse'))
    render(<RollingTrendChartCard trend={profile.trend} width={400} height={dims.CHART_HEIGHT} />)
    const real = screen.getByTestId('trend-card')
    expect(real.className).toContain(dims.TREND_CARD_MIN_HEIGHT)
    expect(real.className).toContain(dims.TREND_CARD_WRAPPER)
  })
})
