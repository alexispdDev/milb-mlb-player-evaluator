import { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
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

  it('has no text, keyframe animation or card styling', () => {
    const { container } = render(<SemicircularGauge percentile={60} color="red" />)
    expect(container.querySelector('text')).toBeNull()
    expect(container.innerHTML).not.toMatch(/animation|keyframes|bg-card|padding|border/i)
  })

  describe('needle sweep', () => {
    let queue: Map<number, FrameRequestCallback>
    let nextId: number
    const flush = () =>
      act(() => {
        const cbs = [...queue.values()]
        queue.clear()
        cbs.forEach((cb) => cb(0))
      })

    beforeEach(() => {
      queue = new Map()
      nextId = 1
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        const id = nextId++
        queue.set(id, cb)
        return id
      })
      vi.stubGlobal('cancelAnimationFrame', (id: number) => {
        queue.delete(id)
      })
    })
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('first render (no effects) is at rotate(0deg) with the final angle in the attribute', () => {
      const html = renderToString(<SemicircularGauge percentile={50} />)
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const n = doc.querySelector('[data-testid="gauge-needle"]')!
      expect(n.getAttribute('style')).toMatch(/transform:\s*rotate\(0deg\)/)
      expect(n.getAttribute('style')).toMatch(/transform-origin:\s*100px 100px/)
      expect(n.getAttribute('transform')).toBe('rotate(90 100 100)')
    })

    it.each([
      [0, 0],
      [25, 45],
      [50, 90],
      [100, 180],
    ])('moves to the target after the frame for percentile %s', (p, deg) => {
      render(<SemicircularGauge percentile={p} />)
      expect(needle().style.transform).toBe('rotate(0deg)')
      flush()
      expect(needle().style.transform).toBe(`rotate(${deg}deg)`)
      expect(needle().style.transformOrigin).toBe('100px 100px')
      expect(needle()).toHaveAttribute('transform', `rotate(${deg} 100 100)`)
    })

    it('keeps the same needle node and sweeps from the old angle on change', () => {
      const { rerender } = render(<SemicircularGauge percentile={25} />)
      flush()
      const before = needle()
      expect(before.style.transform).toBe('rotate(45deg)')
      rerender(<SemicircularGauge percentile={75} />)
      expect(needle()).toBe(before)
      expect(needle().style.transform).toBe('rotate(45deg)')
      expect(needle()).toHaveAttribute('transform', 'rotate(135 100 100)')
      flush()
      expect(needle().style.transform).toBe('rotate(135deg)')
    })

    it('reaches the final state after a StrictMode effect double-invoke', () => {
      render(
        <StrictMode>
          <SemicircularGauge percentile={50} />
        </StrictMode>,
      )
      flush()
      expect(needle().style.transform).toBe('rotate(90deg)')
    })

    it('cancels the pending frame on unmount without warnings', () => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { unmount } = render(<SemicircularGauge percentile={50} />)
      expect(queue.size).toBe(1)
      unmount()
      expect(queue.size).toBe(0)
      expect(() => flush()).not.toThrow()
      expect(err).not.toHaveBeenCalled()
      expect(warn).not.toHaveBeenCalled()
      err.mockRestore()
      warn.mockRestore()
    })

    it('puts the transition in classes, not inline style, and leaves arc and track static', () => {
      render(<SemicircularGauge percentile={50} />)
      for (const c of ['transition-transform', 'duration-700', 'ease-out', 'motion-reduce:transition-none']) {
        expect(needle()).toHaveClass(c)
      }
      expect(needle().getAttribute('style')).not.toMatch(/transition/)
      for (const el of [arc(), track()]) {
        expect(el.getAttribute('class')).toBeNull()
        expect(el.getAttribute('style')).toBeNull()
      }
      expect(arc()).toHaveAttribute('d', gaugeArcPath(0, 90))
    })

    it('N/A mode has no transition classes or transform styles', () => {
      const { container } = render(<SemicircularGauge percentile={null} />)
      expect(container.innerHTML).not.toMatch(/transition-|duration-/)
      expect(container.querySelector('[style*="transform"]')).toBeNull()
      expect(queue.size).toBe(0)
    })
  })

  describe('null percentile (N/A mode)', () => {
    it('renders only a grey track', () => {
      const { container } = render(<SemicircularGauge percentile={null} />)
      const svg = screen.getByTestId('gauge')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('viewBox', '0 0 200 110')
      expect(svg).toHaveAttribute('width', '100%')
      expect(screen.queryByTestId('gauge-arc')).not.toBeInTheDocument()
      expect(screen.queryByTestId('gauge-needle')).not.toBeInTheDocument()
      expect(container.innerHTML).not.toMatch(/color-(above|below)/)
    })

    it('keeps track geometry, with stroke subtext and opacity 0.5', () => {
      render(<SemicircularGauge percentile={null} />)
      expect(track()).toHaveAttribute('d', gaugeArcPath(0, 180))
      expect(track()).toHaveAttribute('fill', 'none')
      expect(track()).toHaveAttribute('stroke-width', '16')
      expect(track()).toHaveAttribute('stroke-linecap', 'round')
      expect(track()).toHaveAttribute('stroke', 'var(--color-subtext)')
      expect(track()).toHaveAttribute('opacity', '0.5')
    })
  })
})
