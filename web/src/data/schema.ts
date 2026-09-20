import { z } from 'zod'

const nonEmpty = z.string().min(1)

const identitySchema = z.object({
  fullName: nonEmpty,
  team: nonEmpty,
  teamLogoUrl: nonEmpty,
  headshotUrl: nonEmpty,
  primaryPosition: nonEmpty,
  bats: z.enum(['L', 'R', 'S']),
  throws: z.enum(['L', 'R', 'S']),
  age: z.number().int().positive(),
})

const summarySchema = z.object({
  plateAppearances: z.number().int().nonnegative(),
  homeRuns: z.number().int().nonnegative(),
  battingAverage: nonEmpty,
  ops: nonEmpty,
})

// z.number() in Zod 4 already rejects NaN and +/-Infinity.
const metricSchema = z.object({
  id: nonEmpty,
  name: nonEmpty,
  unit: nonEmpty,
  value: z.number().nullable(),
  leagueAvg: z.number(),
  percentile: z.number().min(0).max(100).nullable(),
  inverted: z.boolean(),
})

const trendPointSchema = z.object({
  pa: z.number().int().positive(),
  value: z.number(),
})

const trendSchema = z.object({
  metricName: nonEmpty,
  points: z
    .array(trendPointSchema)
    .min(1)
    .refine(
      (points) => points.every((p, i) => i === 0 || p.pa > points[i - 1].pa),
      { message: 'trend pa values must be strictly increasing' },
    ),
})

export const playerProfileSchema = z.object({
  id: nonEmpty,
  season: z.number().int(),
  identity: identitySchema,
  summary: summarySchema,
  metrics: z.array(metricSchema).refine(
    (metrics) => new Set(metrics.map((m) => m.id)).size === metrics.length,
    { message: 'metric ids must be unique within a profile' },
  ),
  trend: trendSchema,
})

export const playerProfilesSchema = z.array(playerProfileSchema)

export type PlayerProfile = z.infer<typeof playerProfileSchema>
export type Identity = z.infer<typeof identitySchema>
export type Summary = z.infer<typeof summarySchema>
export type Metric = z.infer<typeof metricSchema>
export type TrendPoint = z.infer<typeof trendPointSchema>
