import { useStore } from '../hooks/useStore'
import { Connection, ErIdentifier, ErNode, Rectangle } from '../model/DiagramModel'
import { LineSegment } from '../utils/LineSegment'
import SvgPathStringBuilder from '../utils/SvgPathStringBuilder'
import Vector2 from '../utils/Vector2'
import { v4 as uuidv4 } from 'uuid'
import { shape, intersect } from 'svg-intersections'
import { arrayRotate, arrayRotated } from '../utils/Array'
import {
  attributeCircleRadius,
  identifierIntersectionCircleRadius,
  selectedStrokeStyle,
  strokeWidthHitbox,
  strokeWidthMedium,
} from '../Constants'
import { notEmpty } from '../utils/Types'
import { SchemaCategory, SchemaObject, Signature } from '../model/SchemcatModel'
import { useCallback } from 'react'
import { schemcatVisRectangleHeight, schemcatVisRectangleWidth } from './SchemcatVisualizationDiagram'

function closestDistanceOfPointToRectangle(rect: Rectangle, point: Vector2): number {
  const dx = Math.max(rect.left - point.x, 0, point.x - rect.right)
  const dy = Math.max(rect.top - point.y, 0, point.y - rect.bottom)
  return Math.sqrt(dx * dx + dy * dy)
}

interface IdentifierPathReturnType {
  path: string
  lastPoint: Vector2
  begginingLength: number
  endingLength: number
  totalLength: number
  intersectionPoints: Vector2[]
}

function getFenceRectangle(d: number, original: Rectangle): Rectangle {
  const dhalf = d / 2
  return new Rectangle(original.x - dhalf, original.y - dhalf, original.width + d, original.height + d)
}

type IdentifierConnection = LineSegment

function getPathLength(path: string) {
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathEl.setAttributeNS(null, 'd', path)
  return pathEl.getTotalLength()
}

/**
 * Does a linear search to find the length on a SVG `path` where the `point` lies.
 * @param path The path commands from the d attribute of the path.
 * @param point The point to look for.
 * @param tolerance Tolerance of distance to point.
 */
function getPathLengthAtPoint(path: string, point: Vector2, tolerance: number): number {
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathEl.setAttributeNS(null, 'd', path)
  const pathLength = pathEl.getTotalLength()
  let currentLength = 0
  while (currentLength <= pathLength) {
    const currentPoint = Vector2.fromDOMPoint(pathEl.getPointAtLength(currentLength))
    if (currentPoint.distanceTo(point) <= tolerance) {
      return currentLength
    }
    currentLength += tolerance
  }
  console.error(`Point ${point} wasn't found on path ${path} with tolerance ${tolerance}`)
  return -1
}

function identifiersToFence(
  identifiee: Rectangle,
  identifierConnections: IdentifierConnection[]
): IdentifierPathReturnType {
  const margin = 20
  const cornerRadius = 30
  // draw path
  const pathBuilder = new SvgPathStringBuilder()
  const drawingDirections = [Vector2.up, Vector2.left, Vector2.down, Vector2.right]
  const segments = identifiee.getLineSegments()
  const segmentLengths = [0]
  for (let i = 0; i < 4; i++) {
    // shift to make space for the arc
    const from = segments[i].from.add(drawingDirections[i].multiply(cornerRadius))
    const to = segments[i].to.add(drawingDirections[i].multiply(-cornerRadius))
    if (pathBuilder.isEmpty) pathBuilder.start(from)
    pathBuilder.lineTo(to)
    segmentLengths.push(getPathLength(pathBuilder.getPath()))
    // the arc ends at the start of the next segment
    const nextSegmentFrom = segments[(i + 1) % 4].from.add(drawingDirections[(i + 1) % 4].multiply(cornerRadius))
    pathBuilder.arc(cornerRadius, cornerRadius, 0, false, false, nextSegmentFrom)
    segmentLengths.push(getPathLength(pathBuilder.getPath()))
  }
  pathBuilder.close()
  const path = pathBuilder.getPath()

  const pathShape = shape('path', { d: path })
  const lineShapes = identifierConnections.map((conn) =>
    shape('line', { x1: conn.from.x, y1: conn.from.y, x2: conn.to.x, y2: conn.to.y })
  )
  let returnEarly = false
  const intersections = lineShapes
    .map((line, i) => {
      const found = intersect(pathShape, line)
      if (found.points.length !== 1) {
        console.error(
          `Found ${found.points.length} intersections with fence path for line from ${identifierConnections[i].from} to ${identifierConnections[i].to}`
        )
        returnEarly = true
        return undefined
      }
      return new Vector2(found.points[0].x, found.points[0].y)
    })
    .filter(notEmpty)
  if (returnEarly)
    return {
      intersectionPoints: [],
      path: path,
      lastPoint: Vector2.zero,
      endingLength: 0,
      begginingLength: 0,
      totalLength: 0,
    }

  const totalPathLength = getPathLength(path)
  const intersectionsInfo = intersections.map((inter) => ({
    point: inter,
    length: getPathLengthAtPoint(path, inter, 10),
  }))
  intersectionsInfo.sort((a, b) => a.length - b.length)
  let bestRotation = 0
  let bestRotationSum = Infinity
  for (let i = 0; i < intersectionsInfo.length; i++) {
    const rotation = arrayRotated(intersectionsInfo, i)
    let rotationSum = 0
    for (let j = 0; j < rotation.length - 1; j++) {
      let diff = rotation[j + 1].length - rotation[j].length
      if (diff < 0) diff += totalPathLength
      rotationSum += diff
    }
    if (rotationSum < bestRotationSum) {
      bestRotationSum = rotationSum
      bestRotation = i
    }
  }
  arrayRotate(intersectionsInfo, bestRotation)
  let begginingLength = intersectionsInfo[0].length - margin
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathEl.setAttributeNS(null, 'd', path)
  const endLength = (intersectionsInfo[intersectionsInfo.length - 1].length + margin) % totalPathLength
  const lastPoint = Vector2.fromDOMPoint(pathEl.getPointAtLength(endLength))
  if (begginingLength < 0) begginingLength += totalPathLength
  return {
    begginingLength: begginingLength,
    endingLength: endLength,
    totalLength: totalPathLength,
    lastPoint: lastPoint,
    path: path,
    intersectionPoints: intersectionsInfo.map((i) => i.point),
  }
}

export interface IdentifierFenceProps {
  identifier: ErIdentifier
  node: ErNode
  identifiers: ErNode[]
  links: Connection[]
}

export function IdentifierFence(props: IdentifierFenceProps) {
  const rectangle = new Rectangle(props.node.x, props.node.y, props.node.width, props.node.height)
  const selectedEntityIds = useStore((state) => state.diagram.selectedEntities)
  const updateDiagram = useStore((state) => state.updateDiagram)

  const identifierLinks = props.identifiers.map((ident) => {
    const link = props.links.find(
      (link) =>
        (link.fromId === ident.id && link.toId === props.node.id) ||
        (link.toId === ident.id && link.fromId === props.node.id)
    )
    if (!link) throw Error('Not found')
    return link
  })

  const segments = identifierLinks.map((x) => {
    const toId = props.identifiers.find((id) => id.id === x.toId || id.id === x.fromId)
    const from = props.node.getAnchorPoint(x.fromAnchor) || Vector2.zero
    const to = toId?.getAnchorPoint(x.toAnchor) || Vector2.zero
    return { from: from, to: to }
  })

  let minDistance = Math.min(...segments.map((s) => closestDistanceOfPointToRectangle(rectangle, s.to)))
  if (segments.length == 1) {
    minDistance /= 2
  }
  const fenceRectangle = getFenceRectangle(minDistance, rectangle)

  const fence = identifiersToFence(fenceRectangle, segments)
  const dashArrayStroke = (fence.endingLength - fence.begginingLength + fence.totalLength) % fence.totalLength
  const dashArrayGap = fence.totalLength - dashArrayStroke
  const identifier = props.identifier
  const identifierId = identifier.id
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)
  const selectOnClick = (e: React.MouseEvent<SVGElement>) => {
    setSelectedSchemcatEntity()
    if (e.ctrlKey) {
      if (selectedEntityIds.some((x) => x.id === identifierId)) {
        updateDiagram((d) => {
          d.selectedEntities = d.selectedEntities.filter((x) => x.id !== identifierId)
        })
        return
      }
      updateDiagram((d) => {
        d.selectedEntities.push({ id: identifierId, type: 'ErIdentifier' })
      })
      return
    }
    updateDiagram((d) => {
      d.selectedEntities = [{ id: identifierId, type: 'ErIdentifier' }]
    })
  }
  // If the selected stroke style contains a dasharray specification, we need to adjust our dasharray,
  // because we use it to display just the desired length of the path. Note that this will work only
  // if the dasharray contains an even number of numbers, so strokeDasharray: '5' will not work and
  // the following lines need to be adjusted.
  const dashArrayLength =
    (selectedStrokeStyle.strokeDasharray &&
      selectedStrokeStyle.strokeDasharray
        .toString()
        .split(' ')
        .map((x) => parseFloat(x))
        .reduce((a, c) => a + c, 0)) ||
    1
  const selectedStrokeDasharray =
    (selectedStrokeStyle.strokeDasharray &&
      (selectedStrokeStyle.strokeDasharray + ' ').repeat(dashArrayStroke / dashArrayLength) +
        '0 ' +
        dashArrayGap.toString()) ||
    undefined
  return (
    <>
      <path
        d={fence.path}
        strokeWidth={strokeWidthMedium}
        stroke='black'
        fill='none'
        strokeDasharray={`${dashArrayStroke} ${dashArrayGap}`}
        strokeDashoffset={-fence.begginingLength}
        style={
          (selectedEntityIds.some((x) => x.id === identifierId) && {
            ...selectedStrokeStyle,
            strokeDasharray: selectedStrokeDasharray,
          }) ||
          {}
        }></path>
      {/* the following is a hitbox for selecting the identifier */}
      <path
        d={fence.path}
        stroke='rgba(255,0,0,0)'
        fill='none'
        strokeDasharray={`${dashArrayStroke} ${dashArrayGap}`}
        strokeDashoffset={-fence.begginingLength}
        strokeWidth={strokeWidthHitbox}
        onClick={selectOnClick}></path>
      {fence.intersectionPoints.map((p, i) => (
        <circle
          key={`intersection-point-${props.links[i]?.id || uuidv4()}`}
          cx={p.x}
          cy={p.y}
          r={identifierIntersectionCircleRadius}></circle>
      ))}
      <circle cx={fence.lastPoint.x} cy={fence.lastPoint.y} r={attributeCircleRadius} fill='black'></circle>
    </>
  )
}

interface IdentifierFenceForSchemcatVisualizationProps {
  object: SchemaObject
  identifier: Set<Signature>
  schemcat: SchemaCategory
}
export function IdentifierFenceForSchemcatVisualization({
  object,
  identifier,
  schemcat,
}: IdentifierFenceForSchemcatVisualizationProps) {
  const nodes = useStore((state) => state.diagram.nodes)
  const node = useStore(useCallback((state) => state.diagram.nodes.find((x) => x.id == object.key), [object]))
  if (!node) return null
  const rectangle = new Rectangle(
    node.x - schemcatVisRectangleWidth / 2,
    node.y - schemcatVisRectangleHeight / 2,
    schemcatVisRectangleWidth,
    schemcatVisRectangleHeight
  )
  const morphismSignatures = [...identifier.values()].map((x) => x[x.length - 1])
  const morphisms = schemcat.morphisms
    .filter((x) => morphismSignatures.some((s) => s == x.signature[0]))
    .filter((x) => x.domain == object.key)
  const segments: LineSegment[] = morphisms.map((m) => {
    const toNode = nodes.find((x) => x.id == m.codomain)
    if (!toNode) throw new Error('Node not found')
    return { from: new Vector2(node.x, node.y), to: new Vector2(toNode.x, toNode.y) }
  })
  const minDistance = Math.min(...segments.map((s) => closestDistanceOfPointToRectangle(rectangle, s.to)))
  const fenceRectangle = getFenceRectangle(minDistance, rectangle)
  const fence = identifiersToFence(fenceRectangle, segments)
  const dashArrayStroke = (fence.endingLength - fence.begginingLength + fence.totalLength) % fence.totalLength
  const dashArrayGap = fence.totalLength - dashArrayStroke
  return (
    <>
      <path
        d={fence.path}
        strokeWidth={strokeWidthMedium}
        stroke='black'
        fill='none'
        strokeDasharray={`${dashArrayStroke} ${dashArrayGap}`}
        strokeDashoffset={-fence.begginingLength}></path>
      {fence.intersectionPoints.map((p, i) => (
        <circle
          key={`intersection-point-${i}-${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          r={identifierIntersectionCircleRadius}></circle>
      ))}
      <circle cx={fence.lastPoint.x} cy={fence.lastPoint.y} r={attributeCircleRadius} fill='black'></circle>
    </>
  )
}
