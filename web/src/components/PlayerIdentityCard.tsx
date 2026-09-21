import { useState } from 'react'
import { IDENTITY_CARD_MIN_HEIGHT, IDENTITY_CARD_WRAPPER } from './skeletonDimensions'
import type { Identity, PlayerProfile, Summary } from '../data/schema'

function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return `${first}${last}`.toUpperCase()
}

function HeadshotFrame({ identity }: { identity: Identity }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-header">
      {!hasError ? (
        <img
          data-testid="headshot"
          src={identity.headshotUrl}
          alt={`${identity.fullName} headshot`}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          data-testid="initials-fallback"
          className="flex h-full w-full items-center justify-center text-lg font-semibold text-foreground"
        >
          {getInitials(identity.fullName)}
        </div>
      )}
      <span
        data-testid="team-badge"
        className="absolute -bottom-1 -right-1 rounded bg-card px-1.5 py-0.5 text-xs font-semibold text-foreground"
      >
        {identity.team}
      </span>
    </div>
  )
}

function PlayerBio({ identity }: { identity: Identity }) {
  return (
    <div className="min-w-0 flex-1">
      <p
        data-testid="player-name"
        title={identity.fullName}
        className="truncate text-lg font-semibold text-foreground"
      >
        {identity.fullName}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtext">
        <span data-testid="player-position">{identity.primaryPosition}</span>
        <span data-testid="player-bats-throws">{`${identity.bats}/${identity.throws}`}</span>
        <span data-testid="player-age">{`Age ${identity.age}`}</span>
      </div>
    </div>
  )
}

function SummaryPill({
  testId,
  label,
  value,
}: {
  testId: string
  label: string
  value: string | number
}) {
  return (
    <div data-testid={testId} className="rounded bg-header px-3 py-2 text-center">
      <div className="text-xs uppercase text-subtext">{label}</div>
      <div className="text-base font-semibold text-foreground">{value}</div>
    </div>
  )
}

function SummaryStatsBar({ summary }: { summary: Summary }) {
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      <SummaryPill testId="summary-pa" label="PA" value={summary.plateAppearances} />
      <SummaryPill testId="summary-hr" label="HR" value={summary.homeRuns} />
      <SummaryPill testId="summary-avg" label="AVG" value={summary.battingAverage} />
      <SummaryPill testId="summary-ops" label="OPS" value={summary.ops} />
    </div>
  )
}

function PlayerIdentityCard({ profile }: { profile: PlayerProfile }) {
  return (
    <div
      data-testid="identity-card"
      className={`${IDENTITY_CARD_WRAPPER} ${IDENTITY_CARD_MIN_HEIGHT}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <HeadshotFrame key={profile.identity.headshotUrl} identity={profile.identity} />
        <PlayerBio identity={profile.identity} />
      </div>
      <SummaryStatsBar summary={profile.summary} />
    </div>
  )
}

export default PlayerIdentityCard
