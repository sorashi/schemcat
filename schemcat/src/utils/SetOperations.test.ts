import { isSubset } from './SetOperations'

describe('SetOperations', () => {
  test('isSubset', () => {
    expect(isSubset(new Set([1, 2, 3]), new Set([1, 2, 3, 4]))).toBe(true)
    expect(isSubset(new Set(), new Set([1, 2, 3, 4]))).toBe(true)
    expect(isSubset(new Set([1]), new Set())).toBe(false)
    expect(isSubset(new Set([1, 5]), new Set([1, 2, 3]))).toBe(false)
  })
})
