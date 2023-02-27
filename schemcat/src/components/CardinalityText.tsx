import React, { useLayoutEffect, useRef, useState } from 'react'
import { Cardinality } from '../model/DiagramModel'
import { plainToInstance } from 'class-transformer'

export function CardinalityText(props: { multiplicity: Cardinality; x: number; y: number; pathId: string }) {
  const { x, y } = props
  const multiplicity = plainToInstance(Cardinality, props.multiplicity)
  const [textWidth, setTextWidth] = useState(0)
  const [textHeight, setTextHeight] = useState(0)
  const textRef = useRef<SVGTextElement>(null)
  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox()
      setTextWidth(width)
      setTextHeight(height)
    }
  }, [textRef])
  if (multiplicity.isDefault()) return null
  return (
    <text ref={textRef} x={0} y={0} dy={-5} dominantBaseline='auto' textAnchor='middle'>
      <textPath href={`#${props.pathId}`} startOffset='35'>
        {multiplicity.lowerBound}..{multiplicity.upperBound}
      </textPath>
    </text>
  )
}
