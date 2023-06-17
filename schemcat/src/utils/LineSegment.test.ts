import { findIntersectionOfTwoLineSegments } from './LineSegment'
import Vector2 from './Vector2'

describe('intersection of two line segments', () => {
  test('intersecting lines', () => {
    const segment1 = { from: new Vector2(1, 1), to: new Vector2(3, 1) }
    const segment2 = { from: new Vector2(2, -1), to: new Vector2(2, 4) }
    const intersection = findIntersectionOfTwoLineSegments(segment1, segment2)
    expect(intersection).not.toBeNull()
    expect(intersection).to.deep.include({ x: 2, y: 1 })
  })
  test('parallel lines', () => {
    const segment1 = { from: new Vector2(1, 1), to: new Vector2(3, 1) }
    const segment2 = { from: new Vector2(1, 2), to: new Vector2(3, 2) }
    const intersection = findIntersectionOfTwoLineSegments(segment1, segment2)
    expect(intersection).toBeNull()
  })
  test('overlapping lines', () => {
    const segment1 = { from: new Vector2(1, 1), to: new Vector2(3, 1) }
    const segment2 = { from: new Vector2(1, 1), to: new Vector2(2, 1) }
    const intersection = findIntersectionOfTwoLineSegments(segment1, segment2)
    expect(intersection).toBeNull()
  })
})
