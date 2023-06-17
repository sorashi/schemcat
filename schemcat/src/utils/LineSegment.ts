import Vector2 from './Vector2'

export interface LineSegment {
  from: Vector2
  to: Vector2
}

export function findIntersectionOfTwoLineSegments(segment1: LineSegment, segment2: LineSegment): Vector2 | null {
  // source: https://stackoverflow.com/a/565282/1697953
  const p = segment1.from
  const q = segment2.from
  const r = segment1.to.subtract(p)
  const s = segment2.to.subtract(q)
  // segment1 goes from p to p+r
  // segment2 goes from q to q+s
  // any point on segment1 can be expressed for some t ∈ [0;1]: p+tr
  // to find an intersection, use the equation p+tr=q+us, cross product s on both sides
  // by cross product, we mean cross product magnitude
  // some simplification and we get
  // t=((q−p)×s)/(r×s)
  // similarly for segment2
  // u=((q−p)×r)/(r×s)
  const dividend = q.subtract(p).crossProductMagnitude(s)
  const divisor = r.crossProductMagnitude(s)
  if (divisor == 0 && dividend == 0) {
    // the lines are co-linear (either overlapping or disjoint)
    return null
  } else if (divisor == 0) {
    // the lines are parallel and non-intersecting
    return null
  } else {
    const t = dividend / divisor
    const u = q.subtract(p).crossProductMagnitude(r) / divisor
    if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
      // intersection point
      return p.add(r.multiply(t))
    }
  }
  // the lines are not parallel, but do not intersect
  return null
}
