/**
 * Checks whether `set` is a subset of `superset`.
 * @param set
 * @param superset
 */
export function isSubset<T>(set: Set<T>, superset: Set<T>): boolean {
  for (const elem of set) {
    if (!superset.has(elem)) {
      return false
    }
  }
  return true
}
