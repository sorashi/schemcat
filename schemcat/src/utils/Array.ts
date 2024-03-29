/**
 * Rotates a copy of this array as if it was a circle.
 * @param n How many elements to rotate to the left. Can be negative to rotate to the right.
 * @returns The new array
 */
export function arrayRotated<T>(array: Array<T>, n: number): Array<T> {
  n %= array.length
  return array.slice(n, array.length).concat(array.slice(0, n))
}

/**
 * Rotates this array in-place as if it was a circle.
 * @param n How many elements to rotate to the left. Can be negative to rotate to the right.
 * @returns A reference to the original mutated array.
 */
export function arrayRotate<T>(array: Array<T>, n: number): Array<T> {
  n %= array.length
  while (array.length && n < 0) n += array.length
  array.push(...array.splice(0, n))
  return array
}

export function groupBy<T, K>(array: Array<T>, selector: (selector: T) => K): Map<K, T[]> {
  const grouping = new Map<K, T[]>()
  for (const element of array) {
    const property = selector(element)
    if (!grouping.has(property)) grouping.set(property, [])

    grouping.get(property)!.push(element)
  }
  return grouping
}
