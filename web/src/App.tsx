import DashboardLayout from './components/DashboardLayout'
import GaugeGrid from './components/GaugeGrid'
import PlayerIdentityCard from './components/PlayerIdentityCard'
import RollingTrendChartCard from './components/RollingTrendChartCard'
import {
  TempPlayerSelect,
  TempSeasonSelect,
} from './components/TempDashboardControls'
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

function Dashboard({ players }: { players: PlayerProfile[] }) {
  const state = useDashboardState(players)
  const { profile } = state
  if (!profile) return <LoadError />
  return (
    <DashboardLayout
      playerSelector={
        <TempPlayerSelect
          players={listPlayers(players)}
          selectedPlayerId={state.selectedPlayerId}
          onSelectPlayer={state.selectPlayer}
        />
      }
      seasonToggle={
        <TempSeasonSelect
          seasons={state.seasons}
          selectedSeason={state.selectedSeason}
          onSelectSeason={state.selectSeason}
        />
      }
      identity={<PlayerIdentityCard profile={profile} />}
      gauges={<GaugeGrid metrics={profile.metrics} />}
      trend={<RollingTrendChartCard trend={profile.trend} />}
    />
  )
}

function App({ loadResult = defaultLoadResult }: { loadResult?: LoadResult }) {
  if (!loadResult.ok) return <LoadError />
  return <Dashboard players={loadResult.players} />
}

export default App
