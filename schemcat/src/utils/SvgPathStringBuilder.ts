import Vector2 from './Vector2'

export default class SvgPathStringBuilder {
  private path: string[] = []
  start(location: Vector2) {
    this.move(location)
  }
  move(location: Vector2) {
    this.path.push(`M ${location}`)
  }
  moveRelative(by: Vector2) {
    this.path.push(`m ${by}`)
  }
  lineTo(location: Vector2) {
    this.path.push(`L ${location}`)
  }
  lineToRelative(by: Vector2) {
    this.path.push(`l ${by}`)
  }
  horizontalLine(x: number) {
    this.path.push(`H ${x}`)
  }
  horizontalLineRelative(byX: number) {
    this.path.push(`h ${byX}`)
  }
  verticalLine(y: number) {
    this.path.push(`V ${y}`)
  }
  verticalLineRelative(byY: number) {
    this.path.push(`v ${byY}`)
  }
  /** "Closes" the path by drawing a straight line from the current position to the starting point.
   * Usually used at the end of a path, but can be used anywhere.
   */
  close() {
    this.path.push('Z')
  }

  cubicBezier(controlPoint1: Vector2, controlPoint2: Vector2, end: Vector2) {
    this.path.push(`C ${controlPoint1}, ${controlPoint2}, ${end}`)
  }
  cubicBezierRelative(controlPoint1: Vector2, controlPoint2: Vector2, end: Vector2) {
    this.path.push(`c ${controlPoint1}, ${controlPoint2}, ${end}`)
  }
  /** Infers the first control point by reflecting the last control point of the previous curve.
   * If there is no previous curve, uses the last cursor position as the first control point.
   */
  cubicBezierSymmetric(controlPoint2: Vector2, end: Vector2) {
    this.path.push(`S ${controlPoint2}, ${end}`)
  }
  /** Infers the first control point by reflecting the last control point of the previous curve.
   * If there is no previous curve, uses the last cursor position as the first control point.
   */
  cubicBezierSymmetricRelative(controlPoint2: Vector2, end: Vector2) {
    this.path.push(`s ${controlPoint2}, ${end}`)
  }
  quadraticBezier(controlPoint: Vector2, end: Vector2) {
    this.path.push(`Q ${controlPoint}, ${end}`)
  }
  quadraticBezierRelative(controlPoint: Vector2, end: Vector2) {
    this.path.push(`q ${controlPoint}, ${end}`)
  }
  /** Infers the control point from the previous control point.
   * Previous command must have been a quadratic bezier or another symmetric quadratic bezier.
   */
  quadraticBezierSymmetric(end: Vector2) {
    this.path.push(`T ${end}`)
  }
  /** Infers the control point from the previous control point.
   * Previous command must have been a quadratic bezier or another symmetric quadratic bezier.
   */
  quadraticBezierSymmetricRelative(end: Vector2) {
    this.path.push(`t ${end}`)
  }

  /**
   * @param radiusX the x radius of the ellipse from which to draw the arc
   * @param radiusY the y radius of the ellipse from which to draw the arc
   * @param xAxisRotation rotation (in degrees) of the x axis of the ellipse from which to draw the arc
   * @param largeArc true if the arc should be greater than 180 degrees
   * @param sweep true if the arc should begin moving at positive angles, otherwise negative ones
   * @param location location of the arc
   */
  arc(radiusX: number, radiusY: number, xAxisRotation: number, largeArc: boolean, sweep: boolean, location: Vector2) {
    this.path.push(`A ${radiusX} ${radiusY} ${xAxisRotation} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${location}`)
  }
  arcRelative(
    radiusX: number,
    radiusY: number,
    xAxisRotation: number,
    largeArc: boolean,
    sweep: boolean,
    location: Vector2
  ) {
    this.path.push(`a ${radiusX} ${radiusY} ${xAxisRotation} ${largeArc ? 1 : 0} ${sweep ? 1 : 0} ${location}`)
  }

  get isEmpty(): boolean {
    return this.path.length <= 0
  }
  // returning
  getPath(): string {
    return this.path.join(' ')
  }
  finish(): string {
    return this.path.join(' ')
  }
  toString(): string {
    return this.path.join(' ')
  }
}
