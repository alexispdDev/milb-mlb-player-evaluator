import type { ReactNode } from 'react'
import TopNavigation from './TopNavigation'

interface DashboardLayoutProps {
  playerSelector?: ReactNode
  seasonToggle?: ReactNode
  identity?: ReactNode
  gauges?: ReactNode
  trend?: ReactNode
  children?: ReactNode
}

function DashboardLayout({
  playerSelector,
  seasonToggle,
  identity,
  gauges,
  trend,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation
        playerSelector={playerSelector}
        seasonToggle={seasonToggle}
      />
      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 p-6">
        {identity}
        {gauges}
        {trend}
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
