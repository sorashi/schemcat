import React, { useLayoutEffect, useRef, useState } from 'react'
import { Multiplicity } from '../model/DiagramModel'
import { plainToInstance } from 'class-transformer'

export function MultiplicityText(props: { multiplicity: Multiplicity; x: number; y: number }) {
  const { x, y } = props
  const multiplicity = plainToInstance(Multiplicity, props.multiplicity)
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
    <text ref={textRef} x={x - textWidth / 2} y={y - textHeight / 2} dominantBaseline='central' textAnchor='middle'>
      {multiplicity.lowerBound}..{multiplicity.upperBound}
    </text>
  )
}
