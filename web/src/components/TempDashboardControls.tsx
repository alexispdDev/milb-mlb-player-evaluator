interface SeasonSelectProps {
  seasons: number[]
  selectedSeason: number
  onSelectSeason: (season: number) => void
}

// Temporary native control; deleted by #14 (season).
export function TempSeasonSelect({
  seasons,
  selectedSeason,
  onSelectSeason,
}: SeasonSelectProps) {
  return (
    <select
      aria-label="Season"
      data-testid="temp-season-select"
      className="rounded bg-card px-2 py-1 text-foreground"
      value={selectedSeason}
      onChange={(e) => onSelectSeason(Number(e.target.value))}
    >
      {seasons.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
