import React, { useLayoutEffect, useRef, useState } from 'react'
import { Cardinality } from '../model/DiagramModel'
import { plainToInstance } from 'class-transformer'

export function CardinalityText(props: { cardinality: Cardinality; x: number; y: number; pathId: string }) {
  const { x, y } = props
  const cardinality = plainToInstance(Cardinality, props.cardinality)
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
  if (cardinality.isDefault()) return null
  return (
    <text ref={textRef} x={x} y={y} alignmentBaseline='middle' dominantBaseline='middle' textAnchor='start'>
      ({cardinality.lowerBound}, {cardinality.upperBound})
    </text>
  )
}
