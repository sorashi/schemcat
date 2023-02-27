import { useLayoutEffect, useRef, useState } from 'react'

interface SvgConnectionProps {
  points: { x: number; y: number }[]
  onClick?: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void
  style?: React.CSSProperties
  pathId: string
}

function SvgConnection({ points, onClick, style, pathId }: SvgConnectionProps) {
  const ref = useRef<SVGPolylineElement | null>(null)
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(' ')
  return (
    <>
      ref.current &&{' '}
      {/* The first line is the "hit-box".
          It makes a surface for the user to click on which is wider than
          the narrow line that is actually displayed. */}
      <polyline
        id={pathId}
        strokeWidth='15'
        stroke='rgba(255,0,0,0)'
        points={pointsString}
        onClick={(e) => onClick && onClick(e)}></polyline>
      <polyline ref={ref} points={pointsString} fill='none' stroke='black' style={style} />
    </>
  )
}

export default SvgConnection
