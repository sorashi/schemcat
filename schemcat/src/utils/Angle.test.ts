import { normalizeRadiansAngle, toRadians } from './Angle'

test('toRadians converts to radians', () => {
  expect(toRadians(0)).toBeCloseTo(0)
  expect(toRadians(180)).toBeCloseTo(Math.PI)
})

test('normalizeRadiansAngle', () => {
  expect(normalizeRadiansAngle(0)).toBeCloseTo(0)
  expect(normalizeRadiansAngle((-1 / 4) * Math.PI)).toBeCloseTo((7 / 4) * Math.PI)
  expect(normalizeRadiansAngle(-(9 / 4) * Math.PI)).toBeCloseTo((7 / 4) * Math.PI)
})
