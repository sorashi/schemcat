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

/**
 * Represents an angle. Unit independent.
 */
export class Angle {
  private degrees = 0
  private constructor(degrees: number) {
    this.degrees = degrees
  }

  static fromDeg(degrees: number): Angle {
    return new Angle(degrees)
  }
  static fromRad(radians: number): Angle {
    return new Angle(this.radToDeg(radians))
  }
  static degToRad(deg: number): number {
    return (Math.PI * deg) / 180
  }
  static radToDeg(rad: number): number {
    return (180 * rad) / Math.PI
  }
  static get fullCircle(): Angle {
    return Angle.fromDeg(360)
  }
  static get zero(): Angle {
    return Angle.fromDeg(0)
  }

  deg(): number {
    return this.degrees
  }
  rad(): number {
    return Angle.degToRad(this.degrees)
  }

  normalized(): Angle {
    return Angle.fromDeg(((this.degrees % 360) + 360) % 360)
  }
}
