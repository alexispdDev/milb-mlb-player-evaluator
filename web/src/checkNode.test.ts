import { describe, expect, it } from 'vitest'
import { isSupportedNode } from '../scripts/check-node.mjs'

describe('isSupportedNode (default range from package.json engines)', () => {
  it.each([
    ['18.19.1', false],
    ['20.18.9', false],
    ['20.19.0', true],
    ['20.20.0', true],
    ['21.7.0', false],
    ['22.11.9', false],
    ['22.12.0', true],
    ['24.21.0', true],
    ['25.0.0', true],
    ['', false],
    ['garbage', false],
    ['v24.21.0', true],
  ])('%j -> %s', (version, expected) => {
    expect(isSupportedNode(version)).toBe(expected)
  })

  it('evaluates explicit ranges', () => {
    expect(isSupportedNode('20.5.0', '^20.5.0')).toBe(true)
    expect(isSupportedNode('21.0.0', '^20.5.0')).toBe(false)
    expect(isSupportedNode('19.0.0', '>=18.0.0')).toBe(true)
  })

  it('throws on an unsupported range shape', () => {
    expect(() => isSupportedNode('20.19.0', '~20.19.0')).toThrow(/Unsupported engines\.node/)
    expect(() => isSupportedNode('garbage', '~20.19.0')).toThrow()
  })
})
