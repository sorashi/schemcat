import React from 'react'
import { Connection, ErNode as ErNodeModel } from '../model/DiagramModel'
import SvgConnection from './SvgConnection'
import { useStore } from '../hooks/useStore'
import { CardinalityText } from './CardinalityText'
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

interface DiagramConnectionProps {
  link: Connection
  onClick?: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void
}

export function DiagramConnection({ link, onClick }: DiagramConnectionProps) {
  const from = useStore((state) => state.diagram.nodes.find((n) => n.id === link.fromId))
  const to = useStore((state) => state.diagram.nodes.find((n) => n.id === link.toId))
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)
  const points = linkToPoints(from as ErNodeModel, to as ErNodeModel)
  const style: React.CSSProperties | undefined = selectedEntities.some((x) => x.id === link.id)
    ? { stroke: 'green', strokeDasharray: '5,5' }
    : undefined
  return (
    <>
      <SvgConnection onClick={onClick} points={points} style={style} />
      <CardinalityText multiplicity={link.multiplicity} x={points[0].x} y={points[0].y} />
    </>
  )
}
