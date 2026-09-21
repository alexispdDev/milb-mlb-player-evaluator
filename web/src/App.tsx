import DashboardLayout from './components/DashboardLayout'
import GaugeGrid from './components/GaugeGrid'
import GaugeGridSkeleton from './components/GaugeGridSkeleton'
import IdentityCardSkeleton from './components/IdentityCardSkeleton'
import TrendChartSkeleton from './components/TrendChartSkeleton'
import PlayerIdentityCard from './components/PlayerIdentityCard'
import RollingTrendChartCard from './components/RollingTrendChartCard'
import PlayerSelector from './components/PlayerSelector'
import SeasonToggle from './components/SeasonToggle'
import { listPlayers, loadPlayers, type LoadResult } from './data/loadPlayers'
import type { PlayerProfile } from './data/schema'
import { useDashboardState } from './useDashboardState'

const defaultLoadResult: LoadResult = loadPlayers()

function LoadError() {
  return (
    <main>
      <div role="alert" data-testid="load-error-placeholder">
        Unable to load player data.
      </div>
    </main>
  )
}

function Dashboard({
  players,
  loading,
}: {
  players: PlayerProfile[]
  loading: boolean
}) {
  const state = useDashboardState(players)
  const { profile } = state
  if (!profile) return <LoadError />
  return (
    <DashboardLayout
      playerSelector={
        <PlayerSelector
          players={listPlayers(players)}
          selectedId={state.selectedPlayerId}
          onSelect={state.selectPlayer}
        />
      }
      seasonToggle={
        <SeasonToggle
          seasons={state.seasons}
          selected={state.selectedSeason}
          onSelect={state.selectSeason}
        />
      }
      identity={
        loading ? <IdentityCardSkeleton /> : <PlayerIdentityCard profile={profile} />
      }
      gauges={loading ? <GaugeGridSkeleton /> : <GaugeGrid metrics={profile.metrics} />}
      trend={
        loading ? (
          <TrendChartSkeleton />
        ) : (
          <RollingTrendChartCard trend={profile.trend} />
        )
      }
    />
  )
}

function App({
  loadResult = defaultLoadResult,
  loading = false,
}: {
  loadResult?: LoadResult
  loading?: boolean
}) {
  if (!loadResult.ok) return <LoadError />
  return <Dashboard players={loadResult.players} loading={loading} />
}

export default App
