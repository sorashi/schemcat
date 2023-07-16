import React, { useEffect, useLayoutEffect } from 'react'
import { Anchor, Connection, ErNode as ErNodeModel } from '../model/DiagramModel'
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
  let fromAnchorPoint = from.getAnchorPoint(link.fromAnchor)
  let toAnchorPoint = to.getAnchorPoint(link.toAnchor)
  if (!fromAnchorPoint) {
    fromAnchorPoint = new Vector2(from.x, from.y)
  }
  if (!toAnchorPoint) {
    toAnchorPoint = new Vector2(to.x, to.y)
  }
  return [fromAnchorPoint, toAnchorPoint]
}

interface DiagramConnectionProps {
  link: Connection
  onClick?: (e: React.MouseEvent<SVGPathElement, MouseEvent>) => void
}

export function DiagramConnection({ link, onClick }: DiagramConnectionProps) {
  const from = useStore((state) => state.diagram.nodes.find((n) => n.id === link.fromId))
  const to = useStore((state) => state.diagram.nodes.find((n) => n.id === link.toId))
  const updateConnectionById = useStore((state) => state.updateConnectionById)
  if (!from || !to) {
    console.error(`Link ${link.id} from ${link.fromId} to ${link.toId} is missing one of the nodes.`)
    throw new Error(`Link ${link.id} from ${link.fromId} to ${link.toId} is missing one of the nodes.`)
  }

  useLayoutEffect(() => {
    const fromAnchors = from.getAnchorPoints()
    const toAnchors = to.getAnchorPoints()
    if (!fromAnchors[link.fromAnchor]) {
      if (Object.keys(fromAnchors).length < 0) throw new Error(`Node ${from.id} has no anchors`)
      console.info(
        `Updating link "from" anchor from ${link.fromAnchor} to ${
          Object.keys(fromAnchors)[0]
        }, because the entity does not provide the former anchor.`
      )
      updateConnectionById(link.id, (c) => (c.fromAnchor = Object.keys(fromAnchors)[0] as Anchor))
    } else if (!toAnchors[link.toAnchor]) {
      if (Object.keys(toAnchors).length < 0) throw new Error(`Node ${from.id} has no anchors`)
      console.info(
        `Updating link "to" anchor from ${link.toAnchor} to ${
          Object.keys(toAnchors)[0]
        }, because the entity does not provide the former anchor.`
      )
      updateConnectionById(link.id, (c) => (c.toAnchor = Object.keys(toAnchors)[0] as Anchor))
    }
  }, [from, to])
  const pathId = 'path-' + link.id
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)
  const [pointFrom, pointTo] = linkToPoints(link, from, to)
  const cardinalityPosition = pointFrom.add(pointTo.subtract(pointFrom).normalize().multiply(30))
  const style: React.CSSProperties | undefined = selectedEntities.some((x) => x.id === link.id)
    ? { stroke: 'green', strokeDasharray: '5,5' }
    : undefined
  return (
    <>
      <SvgConnection pathId={pathId} onClick={onClick} points={[pointFrom, pointTo]} style={style} />
      <CardinalityText
        pathId={pathId}
        cardinality={link.cardinality}
        x={cardinalityPosition.x}
        y={cardinalityPosition.y}
      />
    </>
  )
}
