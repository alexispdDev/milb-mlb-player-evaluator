import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import players from '../data/players.json'
import { playerProfilesSchema, type PlayerProfile } from '../data/schema'
import PlayerIdentityCard from './PlayerIdentityCard'

const profiles = playerProfilesSchema.parse(players)

function findProfile(fullName: string, season: number): PlayerProfile {
  const profile = profiles.find(
    (p) => p.identity.fullName === fullName && p.season === season,
  )
  if (!profile) throw new Error(`fixture profile not found: ${fullName} ${season}`)
  return profile
}

const freeman = findProfile('Freddie Freeman', 2024)
const bartholomew = findProfile('Bartholomew Rodriguez-Castellanos', 2024)
const carver = findProfile('Nick Carver', 2024)

describe('PlayerIdentityCard', () => {
  it('renders the identity card with all testids and correct text for a fixture profile', () => {
    render(<PlayerIdentityCard profile={freeman} />)

    expect(screen.getByTestId('identity-card')).toHaveClass('bg-card')
    expect(screen.getByTestId('headshot')).toHaveAttribute(
      'src',
      freeman.identity.headshotUrl,
    )
    expect(screen.getByTestId('headshot')).toHaveAttribute(
      'alt',
      'Freddie Freeman headshot',
    )
    expect(screen.queryByTestId('initials-fallback')).not.toBeInTheDocument()
    expect(screen.getByTestId('team-badge')).toHaveTextContent('LAD')

    const name = screen.getByTestId('player-name')
    expect(name).toHaveTextContent('Freddie Freeman')
    expect(name).toHaveClass('text-foreground')

    expect(screen.getByTestId('player-position')).toHaveTextContent('1B')
    expect(screen.getByTestId('player-bats-throws')).toHaveTextContent('L/R')
    expect(screen.getByTestId('player-age')).toHaveTextContent('34')

    expect(screen.getByTestId('summary-pa')).toHaveTextContent('PA')
    expect(screen.getByTestId('summary-pa')).toHaveTextContent('580')
    expect(screen.getByTestId('summary-hr')).toHaveTextContent('HR')
    expect(screen.getByTestId('summary-hr')).toHaveTextContent('21')
    expect(screen.getByTestId('summary-avg')).toHaveTextContent('AVG')
    expect(screen.getByTestId('summary-avg')).toHaveTextContent('.305')
    expect(screen.getByTestId('summary-ops')).toHaveTextContent('OPS')
    expect(screen.getByTestId('summary-ops')).toHaveTextContent('.910')
  })

  it('renders switch-hitter bats/throws correctly', () => {
    render(<PlayerIdentityCard profile={carver} />)
    expect(screen.getByTestId('player-bats-throws')).toHaveTextContent('S/R')
  })

  it('shows the initials fallback only after the headshot image errors', () => {
    render(<PlayerIdentityCard profile={freeman} />)

    expect(screen.getByTestId('headshot')).toBeInTheDocument()
    expect(screen.queryByTestId('initials-fallback')).not.toBeInTheDocument()

    fireEvent.error(screen.getByTestId('headshot'))

    expect(screen.queryByTestId('headshot')).not.toBeInTheDocument()
    expect(screen.getByTestId('initials-fallback')).toHaveTextContent('FF')
  })

  it('derives initials from the first and last words of the full name', () => {
    render(<PlayerIdentityCard profile={bartholomew} />)
    fireEvent.error(screen.getByTestId('headshot'))
    expect(screen.getByTestId('initials-fallback')).toHaveTextContent('BR')
  })

  it('resets the fallback when the profile changes to a different headshotUrl', () => {
    const { rerender } = render(<PlayerIdentityCard profile={freeman} />)

    fireEvent.error(screen.getByTestId('headshot'))
    expect(screen.getByTestId('initials-fallback')).toBeInTheDocument()

    rerender(<PlayerIdentityCard profile={bartholomew} />)

    expect(screen.queryByTestId('initials-fallback')).not.toBeInTheDocument()
    expect(screen.getByTestId('headshot')).toHaveAttribute(
      'src',
      bartholomew.identity.headshotUrl,
    )
  })

  it('applies truncation and a title attribute to long names while keeping the full text in the DOM', () => {
    render(<PlayerIdentityCard profile={bartholomew} />)

    const name = screen.getByTestId('player-name')
    expect(name).toHaveClass('truncate')
    expect(name).toHaveAttribute('title', 'Bartholomew Rodriguez-Castellanos')
    expect(name).toHaveTextContent('Bartholomew Rodriguez-Castellanos')
  })
})
