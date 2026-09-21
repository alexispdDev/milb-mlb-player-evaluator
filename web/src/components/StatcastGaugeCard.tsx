import type { Metric } from '../data/schema'
import { buildGaugeAriaLabel } from './gaugeAria'
import { formatMetricValue, isAboveAverage } from './metricFormat'
import SemicircularGauge from './SemicircularGauge'
import { GAUGE_CARD_MIN_HEIGHT, GAUGE_CARD_WRAPPER } from './skeletonDimensions'

interface StatcastGaugeCardProps {
  metric: Metric
}

function CardHeader({ name }: { name: string }) {
  return (
    <h3
      aria-hidden="true"
      data-testid="gauge-card-title"
      title={name}
      className="w-full truncate text-center text-sm font-semibold text-foreground"
    >
      {name}
    </h3>
  )
}

function MetricValueDisplay({ text }: { text: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex justify-center">
      <span
        data-testid="gauge-card-value"
        className="text-xl font-bold text-foreground"
      >
        {text}
      </span>
    </div>
  )
}

function NotAvailableDisplay() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex justify-center">
      <span data-testid="gauge-card-na" className="text-xl font-bold text-subtext">
        N/A
      </span>
    </div>
  )
}

function LeagueBenchmarkDisplay({ text }: { text: string }) {
  return (
    <p aria-hidden="true" data-testid="gauge-card-benchmark" className="text-xs text-subtext">
      {text}
    </p>
  )
}

function StatcastGaugeCard({ metric }: StatcastGaugeCardProps) {
  const { value, percentile } = metric
  const isNa = value === null || percentile === null
  const color = isNa
    ? undefined
    : isAboveAverage(metric)
      ? 'var(--color-above)'
      : 'var(--color-below)'
  return (
    <div
      role="group"
      aria-label={buildGaugeAriaLabel(metric)}
      data-testid="gauge-card"
      className={`${GAUGE_CARD_WRAPPER} ${GAUGE_CARD_MIN_HEIGHT}`}
    >
      <CardHeader name={metric.name} />
      <div className="relative w-full">
        <SemicircularGauge percentile={isNa ? null : percentile} color={color} />
        {isNa ? (
          <NotAvailableDisplay />
        ) : (
          <MetricValueDisplay text={formatMetricValue(value, metric.unit)} />
        )}
      </div>
      <LeagueBenchmarkDisplay
        text={`Avg: ${formatMetricValue(metric.leagueAvg, metric.unit)}`}
      />
    </div>
  )
}

export default StatcastGaugeCard
