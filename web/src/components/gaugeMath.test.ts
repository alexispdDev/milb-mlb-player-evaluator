import {
  GAUGE_CENTER,
  GAUGE_RADIUS,
  GAUGE_VIEWBOX,
  gaugeArcPath,
  percentileToAngle,
  polarPoint,
} from './gaugeMath'

describe('percentileToAngle', () => {
  it('maps percentiles to degrees', () => {
    expect(percentileToAngle(0)).toBe(0)
    expect(percentileToAngle(50)).toBe(90)
    expect(percentileToAngle(100)).toBe(180)
    expect(percentileToAngle(25)).toBe(45)
  })
  it('clamps out-of-range values', () => {
    expect(percentileToAngle(-10)).toBe(0)
    expect(percentileToAngle(150)).toBe(180)
    expect(percentileToAngle(-Infinity)).toBe(0)
    expect(percentileToAngle(Infinity)).toBe(180)
  })
  it('maps NaN to 0', () => {
    expect(percentileToAngle(NaN)).toBe(0)
  })
})

describe('polarPoint', () => {
  it('returns arc points', () => {
    expect(polarPoint(0)).toEqual({ x: 20, y: 100 })
    expect(polarPoint(90)).toEqual({ x: 100, y: 20 })
    expect(polarPoint(180)).toEqual({ x: 180, y: 100 })
  })
})

describe('gaugeArcPath', () => {
  it('builds arc paths', () => {
    expect(gaugeArcPath(0, 180)).toBe('M 20 100 A 80 80 0 0 1 180 100')
    expect(gaugeArcPath(0, 90)).toBe('M 20 100 A 80 80 0 0 1 100 20')
    expect(gaugeArcPath(0, 0)).toBe('M 20 100 A 80 80 0 0 1 20 100')
  })
  it('clamps angles', () => {
    expect(gaugeArcPath(-20, 400)).toBe(gaugeArcPath(0, 180))
  })
})

describe('constants', () => {
  it('exposes shared geometry', () => {
    expect(GAUGE_VIEWBOX).toBe('0 0 200 110')
    expect(GAUGE_CENTER).toEqual({ x: 100, y: 100 })
    expect(GAUGE_RADIUS).toBe(80)
  })
})
