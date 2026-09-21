import {
  CHART_HEIGHT_CLASS,
  PULSE,
  TREND_CARD_MIN_HEIGHT,
  TREND_CARD_WRAPPER,
} from './skeletonDimensions'

function TrendChartSkeleton() {
  return (
    <div
      data-testid="skeleton-trend"
      aria-busy="true"
      className={`${TREND_CARD_WRAPPER} ${TREND_CARD_MIN_HEIGHT}`}
    >
      <div aria-hidden="true" className={`h-5 w-1/3 rounded bg-header ${PULSE}`} />
      <div
        aria-hidden="true"
        className={`w-full rounded bg-header ${CHART_HEIGHT_CLASS} ${PULSE}`}
      />
    </div>
  )
}

export default TrendChartSkeleton
