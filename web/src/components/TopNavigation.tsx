function AppBrand() {
  return (
    <span data-testid="app-brand" className="text-lg font-semibold text-foreground">
      MLB Hitter Analytics Portal
    </span>
  )
}

function PlayerSelectorSlot() {
  // Placeholder for the future PlayerSelector combobox (task #13).
  return <div data-testid="player-selector-slot" />
}

function SeasonToggleSlot() {
  // Placeholder for the future SeasonToggle control (task #14).
  return <div data-testid="season-toggle-slot" />
}

function TopNavigation() {
  return (
    <header className="flex items-center justify-between gap-6 bg-header px-6 py-4">
      <AppBrand />
      <div className="flex items-center gap-4">
        <PlayerSelectorSlot />
        <SeasonToggleSlot />
      </div>
    </header>
  )
}

export default TopNavigation
