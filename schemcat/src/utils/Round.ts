/** Round to at most the specified number of decimal spaces.
 * In contrast with built-in `toFixed`, this function:
 * 1. returns a number, not a string,
 * 2. does not append zeroes like 99.00 (that's implied by returning a number).
 */
export function roundTo(num: number, decimals: number): number {
  const mul = Math.pow(10, decimals)
  return Math.round(num * mul) / mul
}
