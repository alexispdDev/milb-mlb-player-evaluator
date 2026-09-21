import { readFileSync } from 'node:fs'
import { contrastRatio } from './contrast'

const css = readFileSync('src/index.css', 'utf8')

function token(name: string): string {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`).exec(css)
  if (!m) throw new Error(`Token --color-${name} not found in src/index.css @theme`)
  return m[1]
}

type Pair = [string, string, string]

// Text pairs actually rendered; WCAG 2.1 AA requires >= 4.5.
const textPairs: Pair[] = [
  // StatcastGaugeCard, PlayerIdentityCard, PlayerSelector, SeasonToggle (selected), chart title + tooltip
  ['foreground', 'card', 'foreground on card'],
  // TopNavigation brand, PlayerSelector active option, identity avatar initials
  ['foreground', 'header', 'foreground on header'],
  // body default text
  ['foreground', 'background', 'foreground on background'],
  // gauge N/A + benchmark, identity card labels, chart axis ticks/empty message, selector "no results"
  ['subtext', 'card', 'subtext on card'],
  // SeasonToggle unselected (sits in the header)
  ['subtext', 'header', 'subtext on header'],
  // required by frontend-plan §4.3; not currently rendered as text
  ['subtext', 'background', 'subtext on background'],
  // LoadErrorBanner message and button
  ['above-text', 'card', 'above-text on card'],
  ['above-text', 'header', 'above-text on header'],
  ['above-text', 'background', 'above-text on background'],
]

// Non-text pairs: WCAG 1.4.11 (>= 3), beyond the issue's text requirement.
const nonTextPairs: Pair[] = [
  ['above', 'card', 'gauge arc above average'],
  ['below', 'card', 'gauge arc below average, trend line + dots, SeasonToggle underline'],
  ['subtext', 'card', 'gauge track and neutral/N/A arc'],
  ['foreground', 'card', 'gauge needle'],
  // FOCUS_RING / PEER_FOCUS_RING outline
  ['below', 'background', 'focus outline on background'],
  ['below', 'card', 'focus outline on card'],
  ['below', 'header', 'focus outline on header'],
]

describe('palette contrast (text, WCAG 2.1 AA 4.5:1)', () => {
  it.each(textPairs)('%s on %s meets 4.5:1 (%s)', (fg, bg, label) => {
    const ratio = contrastRatio(token(fg), token(bg))
    expect(ratio, `${label}: ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
  })
})

describe('palette contrast (non-text, WCAG 1.4.11 3:1)', () => {
  it.each(nonTextPairs)('%s on %s meets 3:1 (%s)', (fg, bg, label) => {
    const ratio = contrastRatio(token(fg), token(bg))
    expect(ratio, `${label}: ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3)
  })
})

describe('token lookup', () => {
  it('fails clearly when a token is missing', () => {
    expect(() => token('does-not-exist')).toThrow(/--color-does-not-exist not found/)
  })
})
