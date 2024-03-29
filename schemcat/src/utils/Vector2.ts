import { Angle, toRadians } from './Angle'

export default class Vector2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  static get zero() {
    return new Vector2(0, 0)
  }
  static get left() {
    return new Vector2(-1, 0)
  }
  static get up() {
    return new Vector2(0, -1)
  }
  static get right() {
    return new Vector2(1, 0)
  }
  static get down() {
    return new Vector2(0, 1)
  }
  static fromLengthAndAngle(length: number, angle: Angle): Vector2 {
    const radians = angle.toLeftHandedSystem().rad()
    return new Vector2(Math.cos(radians) * length, Math.sin(radians) * length)
  }
  static fromDOMPoint(point: DOMPoint) {
    return new Vector2(point.x, point.y)
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

  distanceTo(other: Vector2): number {
    return other.subtract(this).length()
  }

  rotate(angle: Angle): Vector2 {
    // Because SVG coordinates use the left-handed Cartesian coordinate system
    // degrees would rotate clockwise.
    // We convert to counter-clockwise rotation.
    const radians = angle.toLeftHandedSystem().rad()
    const sin = Math.sin(radians)
    const cos = Math.cos(radians)
    return new Vector2(cos * this.x - sin * this.y, sin * this.x + cos * this.y)
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  normalize(): Vector2 {
    const length = this.length()
    return new Vector2(this.x / length, this.y / length)
  }

  crossProductMagnitude(other: Vector2): number {
    return this.x * other.y - this.y * other.x
  }

  /** Returns the angle of this vector in radians. Returns in range [0, PI) + [-PI, 0) */
  angle(): Angle {
    return Angle.fromRad(Math.atan2(-this.y, this.x))
  }
  equals(other: Vector2): boolean {
    return this.x == other.x && this.y == other.y
  }
}
