import {
  GAUGE_CARD_MIN_HEIGHT,
  GAUGE_CARD_WRAPPER,
  GAUGE_GRID_CLASSES,
  PULSE,
} from './skeletonDimensions'

function GaugeCardSkeleton() {
  return (
    <div
      data-testid="skeleton-gauge-card"
      className={`${GAUGE_CARD_WRAPPER} ${GAUGE_CARD_MIN_HEIGHT}`}
    >
      <div aria-hidden="true" className={`h-5 w-2/3 rounded bg-header ${PULSE}`} />
      <div aria-hidden="true" className={`w-full flex-1 rounded bg-header ${PULSE}`} />
      <div aria-hidden="true" className={`h-4 w-1/3 rounded bg-header ${PULSE}`} />
    </div>
  )
}

function GaugeGridSkeleton() {
  return (
    <section
      aria-label="Statcast metrics"
      aria-busy="true"
      data-testid="skeleton-gauge-grid"
      className={GAUGE_GRID_CLASSES}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <GaugeCardSkeleton key={i} />
      ))}
    </section>
  )
}

export default GaugeGridSkeleton
