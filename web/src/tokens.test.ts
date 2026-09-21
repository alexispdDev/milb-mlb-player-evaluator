import { readFileSync } from 'node:fs'

const css = readFileSync('src/index.css', 'utf8')

const tokens = {
  '--color-background': '#0b131e',
  '--color-card': '#1e293b',
  '--color-header': '#15202b',
  '--color-foreground': '#f8fafc',
  '--color-subtext': '#94a3b8',
  '--color-above': '#ef4444',
  '--color-above-strong': '#e11d48',
  '--color-below': '#3b82f6',
  '--color-below-strong': '#2563eb',
  '--color-above-text': '#fb7185',
}

describe('design tokens', () => {
  it.each(Object.entries(tokens))('defines %s as %s', (name, value) => {
    expect(css).toContain(`${name}: ${value};`)
  })

  it('sets the page background and text color globally', () => {
    expect(css).toMatch(/body\s*{[^}]*background-color: var\(--color-background\)/)
    expect(css).toMatch(/body\s*{[^}]*color: var\(--color-foreground\)/)
  })
})
