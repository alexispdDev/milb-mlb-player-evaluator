import TopNavigation from './TopNavigation'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="mx-auto max-w-[1440px] p-6">
        <div
          data-testid="identity-card-placeholder"
          className="rounded bg-card p-4 text-subtext"
        >
          Player identity card placeholder
        </div>
        <div
          data-testid="gauge-grid-placeholder"
          className="mt-6 rounded bg-card p-4 text-subtext"
        >
          Gauge grid placeholder
        </div>
        <div
          data-testid="trend-chart-placeholder"
          className="mt-6 rounded bg-card p-4 text-subtext"
        >
          Trend chart placeholder
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
