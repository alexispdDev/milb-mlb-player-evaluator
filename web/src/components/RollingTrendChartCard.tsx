import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PlayerProfile } from '../data/schema'
import {
  CHART_HEIGHT,
  TREND_CARD_MIN_HEIGHT,
  TREND_CARD_WRAPPER,
} from './skeletonDimensions'
import { formatTrendTooltip } from './trendFormat'

type Trend = PlayerProfile['trend']

interface RollingTrendChartCardProps {
  trend: Trend
  /** Recharts animation; tests pass false to avoid timing dependence. */
  isAnimationActive?: boolean
  /** When both width and height are given, the chart skips ResponsiveContainer. */
  width?: number
  height?: number
}

const AXIS_LINE = { stroke: 'var(--color-header)' }
const TICK = { fill: 'var(--color-subtext)', fontSize: 12 }

function ChartHeader({ name }: { name: string }) {
  return (
    <h3
      data-testid="trend-header"
      className="text-sm font-semibold text-foreground"
    >
      {name}
    </h3>
  )
}

interface TooltipPayload {
  payload?: { pa: number; value: number }
}

function TrendTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: readonly TooltipPayload[]
}) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div
      data-testid="trend-tooltip"
      className="rounded-md bg-card px-3 py-2 text-sm text-foreground shadow-lg ring-1 ring-header"
    >
      {formatTrendTooltip(point.pa, point.value)}
    </div>
  )
}

function TrendLineChart({
  trend,
  isAnimationActive = true,
  width,
  height,
}: {
  trend: Trend
  isAnimationActive?: boolean
  width?: number
  height?: number
}) {
  const chart = (w?: number, h?: number) => (
    <LineChart
      data={trend.points}
      width={w}
      height={h}
      accessibilityLayer={false}
      margin={{ top: 8, right: 16, bottom: 24, left: 0 }}
    >
      <CartesianGrid stroke="var(--color-header)" strokeDasharray="3 3" />
      <XAxis
        dataKey="pa"
        type="number"
        domain={['dataMin', 'dataMax']}
        tick={TICK}
        axisLine={AXIS_LINE}
        tickLine={AXIS_LINE}
        label={{
          value: 'Plate appearances',
          position: 'insideBottom',
          offset: -12,
          fill: 'var(--color-subtext)',
          fontSize: 12,
        }}
      />
      <YAxis
        domain={['auto', 'auto']}
        tick={TICK}
        axisLine={AXIS_LINE}
        tickLine={AXIS_LINE}
      />
      <Tooltip
        content={TrendTooltipContent}
        cursor={{ stroke: 'var(--color-subtext)' }}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke="var(--color-below)"
        strokeWidth={2}
        dot={{ r: 3, fill: 'var(--color-below)', stroke: 'var(--color-below)' }}
        activeDot={{ r: 5 }}
        isAnimationActive={isAnimationActive}
      />
    </LineChart>
  )
  return (
    <div
      role="img"
      aria-label={`${trend.metricName}: rolling trend over plate appearances`}
      data-testid="trend-chart"
      className="w-full min-w-0"
    >
      {width !== undefined && height !== undefined ? (
        chart(width, height)
      ) : (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          {chart()}
        </ResponsiveContainer>
      )}
    </div>
  )
}

function RollingTrendChartCard({
  trend,
  isAnimationActive,
  width,
  height,
}: RollingTrendChartCardProps) {
  return (
    <div
      data-testid="trend-card"
      className={`${TREND_CARD_WRAPPER} ${TREND_CARD_MIN_HEIGHT}`}
    >
      <ChartHeader name={trend.metricName} />
      {trend.points.length === 0 ? (
        <p data-testid="trend-empty" className="text-sm text-subtext">
          No trend data
        </p>
      ) : (
        <TrendLineChart
          trend={trend}
          isAnimationActive={isAnimationActive}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}

export default RollingTrendChartCard
