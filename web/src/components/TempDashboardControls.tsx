import type { PlayerSummary } from '../data/loadPlayers'

interface PlayerSelectProps {
  players: PlayerSummary[]
  selectedPlayerId: string
  onSelectPlayer: (id: string) => void
}

interface SeasonSelectProps {
  seasons: number[]
  selectedSeason: number
  onSelectSeason: (season: number) => void
}

// Temporary native controls; deleted by #13 (player) and #14 (season).
export function TempPlayerSelect({
  players,
  selectedPlayerId,
  onSelectPlayer,
}: PlayerSelectProps) {
  return (
    <select
      aria-label="Player"
      data-testid="temp-player-select"
      className="rounded bg-card px-2 py-1 text-foreground"
      value={selectedPlayerId}
      onChange={(e) => onSelectPlayer(e.target.value)}
    >
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.fullName}
        </option>
      ))}
    </select>
  )
}

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
