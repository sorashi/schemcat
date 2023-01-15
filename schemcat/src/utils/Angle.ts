export function toRadians(degrees: number) {
  return (Math.PI * degrees) / 180
}

/**
 * Returns the same angle in radians but normalized into the range [0, 2*PI)
 */
export function normalizeRadiansAngle(radians: number) {
  const circle = 2 * Math.PI
  return ((radians % circle) + circle) % circle
}
