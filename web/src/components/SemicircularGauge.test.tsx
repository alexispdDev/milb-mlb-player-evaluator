import { render, screen } from '@testing-library/react'
import SemicircularGauge from './SemicircularGauge'
import { gaugeArcPath } from './gaugeMath'

const needle = () => screen.getByTestId('gauge-needle')
const arc = () => screen.getByTestId('gauge-arc')
const track = () => screen.getByTestId('gauge-track')

describe('SemicircularGauge', () => {
  it('renders a decorative, scalable svg root', () => {
    render(<SemicircularGauge percentile={50} color="red" />)
    const svg = screen.getByTestId('gauge')
    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 200 110')
    expect(svg).toHaveAttribute('width', '100%')
    expect(svg).not.toHaveAttribute('height')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it('renders a neutral track', () => {
    render(<SemicircularGauge percentile={50} color="red" />)
    expect(track()).toHaveAttribute('d', 'M 20 100 A 80 80 0 0 1 180 100')
    expect(track()).toHaveAttribute('fill', 'none')
    expect(track()).toHaveAttribute('stroke', 'var(--color-subtext)')
    expect(track()).toHaveAttribute('stroke-width', '16')
    expect(track()).toHaveAttribute('stroke-linecap', 'round')
    expect(track()).toHaveAttribute('opacity', '0.25')
  })

  it('renders the value arc with the color prop', () => {
    render(<SemicircularGauge percentile={50} color="var(--color-above)" />)
    expect(arc()).toHaveAttribute('d', gaugeArcPath(0, 90))
    expect(arc()).toHaveAttribute('fill', 'none')
    expect(arc()).toHaveAttribute('stroke', 'var(--color-above)')
    expect(arc()).toHaveAttribute('stroke-width', '16')
    expect(arc()).toHaveAttribute('stroke-linecap', 'round')
  })

  it('renders a zero-length arc at percentile 0', () => {
    render(<SemicircularGauge percentile={0} color="red" />)
    expect(arc()).toHaveAttribute('d', 'M 20 100 A 80 80 0 0 1 20 100')
  })

  it('renders the needle', () => {
    render(<SemicircularGauge percentile={50} color="red" />)
    const n = needle()
    expect(n.tagName.toLowerCase()).toBe('line')
    expect(n).toHaveAttribute('x1', '100')
    expect(n).toHaveAttribute('y1', '100')
    expect(n).toHaveAttribute('x2', '28')
    expect(n).toHaveAttribute('y2', '100')
    expect(n).toHaveAttribute('stroke', 'var(--color-foreground)')
    expect(n).toHaveAttribute('stroke-width', '3')
    expect(n).toHaveAttribute('stroke-linecap', 'round')
  })

  it.each([
    [0, 'rotate(0 100 100)'],
    [50, 'rotate(90 100 100)'],
    [100, 'rotate(180 100 100)'],
    [25, 'rotate(45 100 100)'],
  ])('rotates the needle for percentile %s', (p, transform) => {
    render(<SemicircularGauge percentile={p} color="red" />)
    expect(needle()).toHaveAttribute('transform', transform)
  })

  it.each([
    [-5, 0],
    [140, 100],
    [NaN, 0],
  ])('treats out-of-range %s like %s', (bad, good) => {
    const { unmount } = render(<SemicircularGauge percentile={good} color="red" />)
    const expected = [needle().getAttribute('transform'), arc().getAttribute('d')]
    unmount()
    render(<SemicircularGauge percentile={bad} color="red" />)
    expect([needle().getAttribute('transform'), arc().getAttribute('d')]).toEqual(expected)
  })

  it('changes only the arc stroke when color changes', () => {
    const { rerender } = render(<SemicircularGauge percentile={60} color="red" />)
    const before = [track().getAttribute('stroke'), needle().getAttribute('stroke')]
    expect(arc()).toHaveAttribute('stroke', 'red')
    rerender(<SemicircularGauge percentile={60} color="blue" />)
    expect(arc()).toHaveAttribute('stroke', 'blue')
    expect([track().getAttribute('stroke'), needle().getAttribute('stroke')]).toEqual(before)
  })

  it('has no text, animation or card styling', () => {
    const { container } = render(<SemicircularGauge percentile={60} color="red" />)
    expect(container.querySelector('text')).toBeNull()
    expect(container.innerHTML).not.toMatch(/transition|animation|keyframes|bg-card|padding|border/i)
  })
})
