import players from './players.json'
import { playerProfilesSchema, type PlayerProfile } from './schema'

export type PlayerSummary = { id: string; fullName: string }

export type LoadError = {
  kind: 'invalid-schema' | 'duplicate-profile' | 'empty'
  message: string
}

export type LoadResult = { ok: true; players: PlayerProfile[] } | { ok: false; error: LoadError }

function fail(kind: LoadError['kind'], message: string): LoadResult {
  return { ok: false, error: { kind, message } }
}

export function loadPlayers(input: unknown = players): LoadResult {
  const parsed = playerProfilesSchema.safeParse(input)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue?.path.length ? issue.path.join('.') : '(root)'
    return fail(
      'invalid-schema',
      `Invalid player data at ${path}: ${issue?.message ?? 'unknown error'}`,
    )
  }
  const profiles = parsed.data
  if (profiles.length === 0) {
    return fail('empty', 'Player data contains no players.')
  }
  const seen = new Set<string>()
  for (const p of profiles) {
    const key = JSON.stringify([p.id, p.season])
    if (seen.has(key)) {
      return fail(
        'duplicate-profile',
        `Duplicate profile for player ${p.id} in season ${p.season}.`,
      )
    }
    seen.add(key)
  }
  return { ok: true, players: profiles }
}

export function listPlayers(profiles: PlayerProfile[]): PlayerSummary[] {
  const latest = new Map<string, PlayerProfile>()
  for (const p of profiles) {
    const current = latest.get(p.id)
    if (!current || p.season > current.season) latest.set(p.id, p)
  }
  return [...latest.values()].map((p) => ({
    id: p.id,
    fullName: p.identity.fullName,
  }))
}

export function getProfile(
  profiles: PlayerProfile[],
  playerId: string,
  season: number,
): PlayerProfile | undefined {
  return profiles.find((p) => p.id === playerId && p.season === season)
}

export function filterPlayers(list: PlayerSummary[], query: string): PlayerSummary[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...list]
  return list.filter((p) => p.fullName.toLowerCase().includes(q))
}
