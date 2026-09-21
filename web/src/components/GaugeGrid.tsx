import type { Metric } from '../data/schema'
import StatcastGaugeCard from './StatcastGaugeCard'

interface GaugeGridProps {
  metrics: Metric[]
}

function GaugeGrid({ metrics }: GaugeGridProps) {
  return (
    <section
      aria-label="Statcast metrics"
      data-testid="gauge-grid"
      className="grid grid-cols-2 gap-4 min-[1024px]:grid-cols-4"
    >
      {metrics.map((metric) => (
        <StatcastGaugeCard key={metric.id} metric={metric} />
      ))}
    </section>
  )
}

export default GaugeGrid
