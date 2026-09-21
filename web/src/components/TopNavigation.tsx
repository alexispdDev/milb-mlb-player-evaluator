import type { ReactNode } from 'react'

interface TopNavigationProps {
  playerSelector?: ReactNode
  seasonToggle?: ReactNode
}

function AppBrand() {
  return (
    <span data-testid="app-brand" className="text-lg font-semibold text-foreground">
      MLB Hitter Analytics Portal
    </span>
  )
}

function TopNavigation({ playerSelector, seasonToggle }: TopNavigationProps) {
  return (
    <header className="flex items-center justify-between gap-6 bg-header px-6 py-4">
      <AppBrand />
      <div className="flex items-center gap-4">
        <div data-testid="player-selector-slot">{playerSelector}</div>
        <div data-testid="season-toggle-slot">{seasonToggle}</div>
      </div>
    </header>
  )
}

export default TopNavigation
