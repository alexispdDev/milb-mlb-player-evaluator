import { describe, expect, it } from 'vitest'
import { isSupportedNode } from '../scripts/check-node.mjs'

describe('isSupportedNode (default range from package.json engines)', () => {
  it.each([
    ['18.19.1', false],
    ['20.19.0', false],
    ['20.20.2', false],
    ['21.7.3', false],
    ['22.12.0', false],
    ['22.21.1', false],
    ['22.22.1', false],
    ['22.22.2', true],
    ['22.23.2', true],
    ['23.11.0', false],
    ['24.14.9', false],
    ['24.15.0', true],
    ['24.21.0', true],
    ['25.0.0', false],
    ['26.0.0', true],
    ['26.9.0', true],
    ['27.0.0', false],
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
    expect(isSupportedNode('20.19.0', '^20.19.0 || >=22.12.0')).toBe(true)
  })

  it('throws on an unsupported range shape', () => {
    expect(() => isSupportedNode('20.19.0', '~20.19.0')).toThrow(/Unsupported engines\.node/)
    expect(() => isSupportedNode('garbage', '~20.19.0')).toThrow()
    expect(() => isSupportedNode('24.21.0', '~20.19.0')).toThrow()
  })
})
