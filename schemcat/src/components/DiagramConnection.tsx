import React from 'react'
import { Connection, ErNode as ErNodeModel } from '../model/DiagramModel'
import SvgConnection from './SvgConnection'
import { useStore } from '../hooks/useStore'
import { CardinalityText } from './CardinalityText'
import { plainToInstance } from 'class-transformer'
import Vector2 from '../utils/Vector2'

export function linkToPoints(link: Connection, fromNode: ErNodeModel, toNode: ErNodeModel): Vector2[] {
  // The link could be deserialized from persisted data JSON. We must
  // assign the object to an instance of ErNodeModel to guarantee
  // existence of its methods. This could be improved by implementing a
  // custom deserializer.
  const { from, to } = {
    from: plainToInstance(ErNodeModel, fromNode),
    to: plainToInstance(ErNodeModel, toNode),
  }
  const fromAnchorPoint = from.getAnchorPoint(link.fromAnchor)
  const toAnchorPoint = to.getAnchorPoint(link.toAnchor)
  return [fromAnchorPoint, toAnchorPoint]
}

interface DiagramConnectionProps {
  link: Connection
  onClick?: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void
}

export function DiagramConnection({ link, onClick }: DiagramConnectionProps) {
  const from = useStore((state) => state.diagram.nodes.find((n) => n.id === link.fromId))
  const to = useStore((state) => state.diagram.nodes.find((n) => n.id === link.toId))
  if (!from || !to) {
    console.error(`Link ${link.id} from ${link.fromId} to ${link.toId} is missing one of the nodes.`)
    throw new Error(`Link ${link.id} from ${link.fromId} to ${link.toId} is missing one of the nodes.`)
  }
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)
  const points = linkToPoints(link, from, to)
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
