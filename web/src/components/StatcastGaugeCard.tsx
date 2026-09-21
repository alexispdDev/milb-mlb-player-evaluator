import type { Metric } from '../data/schema'
import { formatMetricValue, isAboveAverage } from './metricFormat'
import SemicircularGauge from './SemicircularGauge'

interface StatcastGaugeCardProps {
  metric: Metric
}

function CardHeader({ name }: { name: string }) {
  return (
    <h3
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
    <div className="absolute inset-x-0 bottom-0 flex justify-center">
      <span
        data-testid="gauge-card-value"
        className="text-xl font-bold text-foreground"
      >
        {text}
      </span>
    </div>
  )
}

function LeagueBenchmarkDisplay({ text }: { text: string }) {
  return (
    <p data-testid="gauge-card-benchmark" className="text-xs text-subtext">
      {text}
    </p>
  )
}

function StatcastGaugeCard({ metric }: StatcastGaugeCardProps) {
  const { value, percentile } = metric
  const color = isAboveAverage(metric) ? 'var(--color-above)' : 'var(--color-below)'
  return (
    <div
      data-testid="gauge-card"
      className="flex min-w-0 flex-col items-center gap-2 rounded-lg bg-card p-4"
    >
      <CardHeader name={metric.name} />
      {value !== null && percentile !== null && (
        <div className="relative w-full">
          <SemicircularGauge percentile={percentile} color={color} />
          <MetricValueDisplay text={formatMetricValue(value, metric.unit)} />
        </div>
      )}
      <LeagueBenchmarkDisplay
        text={`Avg: ${formatMetricValue(metric.leagueAvg, metric.unit)}`}
      />
    </div>
  )
}

export default StatcastGaugeCard
