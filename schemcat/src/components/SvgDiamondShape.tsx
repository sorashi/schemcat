import React from 'react'
import { toRadians } from '../utils/Angle'

function convertToFloat(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (isNaN(parsed)) return undefined
  }
  return undefined
}

function getPolygonPoints(props: React.SVGProps<SVGPolygonElement>): string {
  // return `${x},${y + height / 2} ${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height}`
  // temporary "bounding diamond"
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  } = {
    x: convertToFloat(props.x),
    y: convertToFloat(props.y),
    width: convertToFloat(props.width),
    height: convertToFloat(props.height),
  }
  const angle = toRadians(25)
  const a = height / 2
  const b = width / 2
  const cPrime = a / Math.tan(angle)
  const dPrime = b * Math.tan(angle)
  const pointA = `${x - cPrime},${a}`
  const pointB = `${b},${y - dPrime}`
  const pointC = `${x + width + cPrime},${a}`
  const pointD = `${b},${y + height + dPrime}`
  return `${pointA} ${pointB} ${pointC} ${pointD}`
}

function SvgDiamondShape(props: React.SVGProps<SVGPolygonElement>) {
  return <polygon {...props} points={getPolygonPoints(props)} strokeLinejoin='round'></polygon>
}

export default SvgDiamondShape
