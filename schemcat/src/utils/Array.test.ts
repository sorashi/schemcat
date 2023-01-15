import { arrayRotate, arrayRotated } from './Array'

test('arrayRotate', () => {
  const arr = [0, 1, 2, 3, 4]
  expect(arrayRotate(arr, 1)).toEqual([1, 2, 3, 4, 0])
  // original array mutated
  expect(arr).toEqual([1, 2, 3, 4, 0])
  expect(arrayRotate(arr, -1)).toEqual([0, 1, 2, 3, 4])
  expect(arrayRotate(arr, 2)).toEqual([2, 3, 4, 0, 1])
})

test('arrayRotated', () => {
  const arr = [0, 1, 2, 3, 4]
  expect(arrayRotated(arr, 1)).toEqual([1, 2, 3, 4, 0])
  // original array remains intact
  expect(arr).toEqual([0, 1, 2, 3, 4])
  expect(arrayRotated(arr, -1)).toEqual([4, 0, 1, 2, 3])
  expect(arrayRotated(arr, 2)).toEqual([2, 3, 4, 0, 1])
})
