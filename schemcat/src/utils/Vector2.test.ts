import Vector2 from './Vector2'

describe('vector operations for line segment intersection tests', () => {
  const p = new Vector2(1, 1)
  const q = new Vector2(2, -1)
  const p2 = new Vector2(3, 1)
  const q2 = new Vector2(2, 4)
  const r = new Vector2(2, 0)
  const s = new Vector2(0, 5)
  test('subtraction', () => {
    expect(p2.subtract(p)).toEqual(r)
    expect(q2.subtract(q)).toEqual(s)
    expect(q.subtract(p)).toEqual(new Vector2(1, -2))
  })
  test('cross product magnitude', () => {
    expect(r.crossProductMagnitude(s)).toBe(10)
    expect(new Vector2(1, -2).crossProductMagnitude(s)).toBe(5)
    expect(new Vector2(1, -2).crossProductMagnitude(r)).toBe(4)
  })
})
