import { GAUGE_VIEWBOX, gaugeArcPath, percentileToAngle } from './gaugeMath'

interface SemicircularGaugeProps {
  percentile: number | null
  color?: string
}

function SemicircularGauge({ percentile, color }: SemicircularGaugeProps) {
  if (percentile === null) {
    return (
      <svg data-testid="gauge" viewBox={GAUGE_VIEWBOX} width="100%" aria-hidden="true">
        <path
          data-testid="gauge-track"
          d={gaugeArcPath(0, 180)}
          fill="none"
          stroke="var(--color-subtext)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    )
  }
  const angle = percentileToAngle(percentile)
  return (
    <svg data-testid="gauge" viewBox={GAUGE_VIEWBOX} width="100%" aria-hidden="true">
      <path
        data-testid="gauge-track"
        d={gaugeArcPath(0, 180)}
        fill="none"
        stroke="var(--color-subtext)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.25"
      />
      <path
        data-testid="gauge-arc"
        d={gaugeArcPath(0, angle)}
        fill="none"
        stroke={color ?? 'var(--color-subtext)'}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <line
        data-testid="gauge-needle"
        x1="100"
        y1="100"
        x2="28"
        y2="100"
        stroke="var(--color-foreground)"
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${angle} 100 100)`}
      />
    </svg>
  )
}

export default SemicircularGauge
