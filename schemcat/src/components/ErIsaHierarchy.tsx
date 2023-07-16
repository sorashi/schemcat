import { useMemo } from 'react'
import { strokeWidthMedium } from '../Constants'
import { StoreModel, useStore } from '../hooks/useStore'
import { Anchor, ErIsaHierarchy as ErIsaHierarchyModel, ErNode } from '../model/DiagramModel'
import Vector2 from '../utils/Vector2'
import { getMarkerUrl } from './Markers'
import { emptyTriangleMarkerId } from './Markers/EmptyTriangleMarker'
import isEqual from 'react-fast-compare'

interface ErIsaHierarchyProps {
  erIsaHierarchy: ErIsaHierarchyModel
  onClick?: (e: React.MouseEvent<SVGElement, MouseEvent>) => void
}

const selectedStyle = {
  stroke: 'green',
  strokeDasharray: '5,5',
}

function getNodePosition(node: ErNode, anchor: Anchor | undefined): Vector2 {
  let pos = new Vector2(node.x, node.y)
  if (anchor) {
    const anchorPoint = node.getAnchorPoint(anchor)
    if (anchorPoint) pos = anchorPoint
  }
  return pos
}

/**
 * Find a meeting point
 */
function getMeetingPoint(
  parentNode: ErNode,
  childrenNodes: ErNode[],
  erIsaHierarchy: ErIsaHierarchyModel | undefined
): Vector2 {
  if (childrenNodes.length <= 0) {
    throw new Error('childrenNodes.length <= 0')
  }
  const parentPos = getNodePosition(parentNode, erIsaHierarchy?.parentAnchor)
  const averageChildrenPosition = childrenNodes
    .reduce(
      (acc, childNode) => acc.add(getNodePosition(childNode, erIsaHierarchy?.childrenAnchors.get(childNode.id))),
      new Vector2(0, 0)
    )
    .multiply(1 / childrenNodes.length)
  const difference = averageChildrenPosition.subtract(parentPos)
  return parentPos.add(difference.multiply(0.5))
}

export interface ErIsaHierarchyRawProps {
  id: number
  parentNode: ErNode
  childrenNodes: ErNode[]
  erIsaHierarchy: ErIsaHierarchyModel
  selected: boolean
}

export function ErIsaHierarchyRaw({
  id,
  parentNode,
  childrenNodes,
  erIsaHierarchy,
  selected = false,
}: ErIsaHierarchyRawProps) {
  const meetingPoint = getMeetingPoint(parentNode, childrenNodes, erIsaHierarchy)
  const parentPos = useMemo(
    () => getNodePosition(parentNode, erIsaHierarchy?.parentAnchor),
    [parentNode, erIsaHierarchy]
  )
  return (
    <g strokeWidth={1} stroke='black'>
      <line
        markerEnd={getMarkerUrl(emptyTriangleMarkerId)}
        x1={meetingPoint.x}
        y1={meetingPoint.y}
        x2={parentPos?.x || parentNode.x}
        y2={parentPos?.y || parentNode.y}
        style={selected ? selectedStyle : {}}
        strokeWidth={strokeWidthMedium}></line>

      {childrenNodes.map((childNode) => {
        const childAnchor = erIsaHierarchy.childrenAnchors.get(childNode.id)
        const nodePos = getNodePosition(childNode, childAnchor)
        return (
          <line
            key={`er-isa-hierarchy-${id}-child-line-${childNode.id}`}
            x1={nodePos.x}
            y1={nodePos.y}
            x2={meetingPoint.x}
            y2={meetingPoint.y}
            style={selected ? selectedStyle : {}}
            strokeWidth={strokeWidthMedium}></line>
        )
      })}
    </g>
  )
}

function ErIsaHierarchy({ erIsaHierarchy, onClick }: ErIsaHierarchyProps) {
  const parentNode = useStore((state: StoreModel) => state.diagram.nodes.find((x) => x.id === erIsaHierarchy.parent))
  const childrenNodes = useStore((state) => state.diagram.nodes.filter((x) => erIsaHierarchy.children.has(x.id)))
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)
  if (!parentNode || childrenNodes.length <= 0) {
    // invalid ErIsaHierarchy
    // TODO: show error
    console.error('Invalid ErIsaHierarchy', erIsaHierarchy)
    return <></>
  }
  const meetingPoint = getMeetingPoint(parentNode, childrenNodes)
  const selected = selectedEntities.some((x) => x.id === erIsaHierarchy.id)
  return (
    <>
      <ErIsaHierarchyRaw
        id={erIsaHierarchy.id}
        parentNode={parentNode}
        childrenNodes={childrenNodes}
        erIsaHierarchy={erIsaHierarchy}
        selected={selected}></ErIsaHierarchyRaw>
      <g strokeWidth={15} stroke='rgba(0,0,0,0)' onClick={onClick}>
        <line x1={meetingPoint.x} y1={meetingPoint.y} x2={parentNode.x} y2={parentNode.y}></line>
        {childrenNodes.map((childNode) => (
          <line
            key={`er-isa-hierarchy-${erIsaHierarchy.id}-child-line-${childNode.id}`}
            x1={childNode.x}
            y1={childNode.y}
            x2={meetingPoint.x}
            y2={meetingPoint.y}></line>
        ))}
      </g>
    </>
  )
}

export default ErIsaHierarchy
