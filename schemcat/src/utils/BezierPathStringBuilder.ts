import Vector2 from './Vector2'

export default class BezierPathStringBuilder {
  private path = ''
  private bezierStarted = false

  addStart(from: Vector2) {
    if (this.bezierStarted) throw new Error('bezier start was already specified')
    this.path += `M ${from}`
    this.bezierStarted = true
  }

  addFirstBezier(from: Vector2, controlPoint1: Vector2, controlPoint2: Vector2, to: Vector2) {
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
    if (!this.bezierStarted) throw new Error("bezier start hasn't been specified yet")
  }

  toString() {
    return this.path
  }
}
