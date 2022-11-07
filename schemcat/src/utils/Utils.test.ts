import { getEnumKeys, toRadians } from './Utils'

test('getEnumKeys returns all keys of an enum', () => {
  enum TestEnum {
    A = 'AValue',
    B = 'BValue',
    C = 'CValue',
  }
  expect(getEnumKeys(TestEnum)).toEqual(['A', 'B', 'C'])
})

test('toRadians converts to radians', () => {
  expect(toRadians(0)).toBeCloseTo(0)
  expect(toRadians(180)).toBeCloseTo(Math.PI)
})
