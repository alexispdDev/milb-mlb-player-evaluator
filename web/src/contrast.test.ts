import { contrastRatio, hexToRgb, relativeLuminance } from './contrast'

describe('hexToRgb', () => {
  it('parses 6-digit hex, case-insensitive, with or without #', () => {
    expect(hexToRgb('#FF8000')).toEqual([255, 128, 0])
    expect(hexToRgb('#ff8000')).toEqual([255, 128, 0])
    expect(hexToRgb('0b131e')).toEqual([11, 19, 30])
  })

  it('rejects 3-digit shorthand and garbage', () => {
    expect(() => hexToRgb('#fff')).toThrow()
    expect(() => hexToRgb('nope')).toThrow()
  })
})

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10)
  })
})

describe('contrastRatio', () => {
  it('is 21 for white on black and 1 for identical colors', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
    expect(contrastRatio('#123456', '#123456')).toBe(1)
  })

  it('passes #767676 on white (~4.54)', () => {
    const r = contrastRatio('#767676', '#ffffff')
    expect(r).toBeCloseTo(4.54, 2)
    expect(r).toBeGreaterThanOrEqual(4.5)
  })

  it('fails #777777 on white (~4.48)', () => {
    const r = contrastRatio('#777777', '#ffffff')
    expect(r).toBeCloseTo(4.48, 2)
    expect(r).toBeLessThan(4.5)
  })

  it('is symmetric and >= 1', () => {
    expect(contrastRatio('#ef4444', '#1e293b')).toBe(contrastRatio('#1e293b', '#ef4444'))
    expect(contrastRatio('#010203', '#fdfeff')).toBeGreaterThanOrEqual(1)
  })
})
