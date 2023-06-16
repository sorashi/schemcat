import SvgPathStringBuilder from './SvgPathStringBuilder'
import Vector2 from './Vector2'

export default class BezierPathStringBuilder {
  private bezierStarted = false
  private pathBuilder: SvgPathStringBuilder = new SvgPathStringBuilder()

  addStart(from: Vector2) {
    if (this.bezierStarted) throw new Error('bezier start was already specified')
    this.pathBuilder.start(from)
    this.bezierStarted = true
  }

  addFirstBezier(from: Vector2, controlPoint1: Vector2, controlPoint2: Vector2, to: Vector2) {
    this.addStart(from)
    this.pathBuilder.cubicBezier(controlPoint1, controlPoint2, to)
  }

  addReflectedBezier(controlPoint2: Vector2, to: Vector2) {
    this.ensureStarted()
    this.pathBuilder.cubicBezierSymmetric(controlPoint2, to)
  }

  addBezier(controlPoint1: Vector2, controlPoint2: Vector2, to: Vector2) {
    this.ensureStarted()
    this.pathBuilder.cubicBezier(controlPoint1, controlPoint2, to)
  }

  private ensureStarted() {
    if (!this.bezierStarted) throw new Error("bezier start hasn't been specified yet")
  }

  toString() {
    return this.pathBuilder.toString()
  }
}
