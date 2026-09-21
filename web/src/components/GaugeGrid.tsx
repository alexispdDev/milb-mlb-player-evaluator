import type { Metric } from '../data/schema'
import StatcastGaugeCard from './StatcastGaugeCard'
import { GAUGE_GRID_CLASSES } from './skeletonDimensions'

interface GaugeGridProps {
  metrics: Metric[]
}

function GaugeGrid({ metrics }: GaugeGridProps) {
  return (
    <section aria-label="Statcast metrics" data-testid="gauge-grid" className={GAUGE_GRID_CLASSES}>
      {metrics.map((metric) => (
        <StatcastGaugeCard key={metric.id} metric={metric} />
      ))}
    </section>
  )
}

export default GaugeGrid
