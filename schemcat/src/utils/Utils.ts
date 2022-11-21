export const getEnumKeys = <T>(
  enumToDeconstruct: T
): Array<keyof typeof enumToDeconstruct> => {
  return Object.keys(enumToDeconstruct as object) as Array<
    keyof typeof enumToDeconstruct
  >
}

/** Transforms client coordinates (perhaps from a `MouseEvent`) to SVG coordinates (the SVG may be scaled, translated, rotated...).
 * Difference between page and client coordinates: https://stackoverflow.com/a/21452887/1697953
 */
export function clientToSvgCoordinates(
  x: number,
  y: number,
  svg: SVGSVGElement | null
): DOMPoint {
  if (svg === null) {
    console.error('SVG is null')
    return new SVGPoint(0, 0)
  }
  const pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  return pt.matrixTransform(svg.getScreenCTM()?.inverse())
}

export function toRadians(degrees: number) {
  return (Math.PI * degrees) / 180
}

export class Vector2 {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  static get zero() {
    return new Vector2(0, 0)
  }
  static fromLengthAndAngle(length: number, degrees: number): Vector2 {
    return new Vector2(
      Math.cos(toRadians(360 - degrees)) * length,
      Math.sin(toRadians(360 - degrees)) * length
    )
  }
  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }
  multiply(coefficient: number): Vector2 {
    return new Vector2(coefficient * this.x, coefficient * this.y)
  }
  toString(): string {
    return `${this.x} ${this.y}`
  }
  negate(): Vector2 {
    return this.multiply(-1)
  }
  subtract(other: Vector2): Vector2 {
    return this.add(other.negate())
  }
  rotate(degrees: number): Vector2 {
    // Because SVG coordinates use the left-handed Cartesian coordinate system
    // degrees would rotate clockwise.
    // We convert to counter-clockwise rotation.
    const theta = toRadians(360 - degrees)
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)
    return new Vector2(cos * this.x - sin * this.y, sin * this.x + cos * this.y)
  }
  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }
  normalize(): Vector2 {
    const length = this.length()
    return new Vector2(this.x / length, this.y / length)
  }
  /** Returns the angle of this vector in radians. Returns in range [0, PI) + [-PI, 0) */
  angle(): number {
    return Math.atan2(-this.y, this.x)
  }
}

export class BezierPathStringBuilder {
  private path = ''
  private bezierStarted = false

  addStart(from: Vector2) {
    if (this.bezierStarted)
      throw new Error('bezier start was already specified')
    this.path += `M ${from}`
    this.bezierStarted = true
  }

  addFirstBezier(
    from: Vector2,
    controlPoint1: Vector2,
    controlPoint2: Vector2,
    to: Vector2
  ) {
    this.addStart(from)
    this.addBezier(controlPoint1, controlPoint2, to)
  }

  addReflectedBezier(controlPoint2: Vector2, to: Vector2) {
    this.checkStarted()
    this.path += ` S ${controlPoint2}, ${to}`
  }

  addBezier(controlPoint1: Vector2, controlPoint2: Vector2, to: Vector2) {
    this.checkStarted()
    this.path += ` C ${controlPoint1}, ${controlPoint2}, ${to}`
  }

  private checkStarted() {
    if (!this.bezierStarted)
      throw new Error("bezier start hasn't been specified yet")
  }

  toString() {
    return this.path
  }
}

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
