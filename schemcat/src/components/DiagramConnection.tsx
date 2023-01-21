import React from 'react'
import { Connection, ErNode as ErNodeModel } from '../model/DiagramModel'
import SvgConnection from './SvgConnection'
import { useStore } from '../hooks/useStore'
import { MultiplicityText } from './MultiplicityText'
import { plainToInstance } from 'class-transformer'

export function linkToPoints(fromNode: ErNodeModel, toNode: ErNodeModel) {
  // The link could be deserialized from persisted data JSON. We must
  // assign the object to an instance of ErNodeModel to guarantee
  // existence of its methods. This could be improved by implementing a
  // custom deserializer.
  const { from, to } = {
    from: plainToInstance(ErNodeModel, fromNode),
    to: plainToInstance(ErNodeModel, toNode),
  }
  let fromAnchorPoints: { x: number; y: number }[] = []
  if (from.getAnchorPoints) fromAnchorPoints = from.getAnchorPoints()
  let toAnchorPoints: { x: number; y: number }[] = []
  if (to.getAnchorPoints) toAnchorPoints = to.getAnchorPoints()
  return [
    {
      x: fromAnchorPoints[0]?.x || from.x,
      y: fromAnchorPoints[0]?.y || from.y,
    },
    { x: toAnchorPoints[0]?.x || to.x, y: toAnchorPoints[0]?.y || to.y },
  ]
}
export function DiagramConnection({ link }: { link: Connection }) {
  const from = useStore((state) => state.diagram.nodes.find((n) => n.id === link.fromId))
  const to = useStore((state) => state.diagram.nodes.find((n) => n.id === link.toId))
  const points = linkToPoints(from as ErNodeModel, to as ErNodeModel)
  return (
    <>
      <SvgConnection points={points} />
      <MultiplicityText multiplicity={link.multiplicity} x={points[0].x} y={points[0].y} />
    </>
  )
}
