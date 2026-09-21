import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Runs with cwd = web/. Every image URL in the fixture must map to a real
// file under public/ (served at the site root).
const players: unknown = JSON.parse(readFileSync('src/data/players.json', 'utf8'))

function collectUrls(node: unknown, out: Set<string>): Set<string> {
  if (Array.isArray(node)) {
    node.forEach((n) => collectUrls(n, out))
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if ((key === 'teamLogoUrl' || key === 'headshotUrl') && typeof value === 'string') {
        out.add(value)
      } else {
        collectUrls(value, out)
      }
    }
  }
  return out
}

const urls = [...collectUrls(players, new Set())].sort()
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

describe('fixture image assets', () => {
  it('finds image URLs in the fixture', () => {
    expect(urls.length).toBeGreaterThan(0)
  })

  it.each(urls)('%s maps to a valid file under public/', (url) => {
    expect(url.startsWith('/')).toBe(true)
    const path = `public${url}`
    expect(existsSync(path), `${path} is missing`).toBe(true)
    expect(statSync(path).size).toBeGreaterThan(0)
    const bytes = readFileSync(path)
    if (url.endsWith('.png')) {
      expect(bytes.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
    } else if (url.endsWith('.svg')) {
      expect(bytes.toString('utf8').trimStart().startsWith('<svg')).toBe(true)
    } else {
      throw new Error(`unsupported image type: ${url}`)
    }
  })
})
