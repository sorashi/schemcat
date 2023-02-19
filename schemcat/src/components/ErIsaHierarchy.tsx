import { StoreModel, useStore } from '../hooks/useStore'
import { ErIsaHierarchy as ErIsaHierarchyModel, ErNode } from '../model/DiagramModel'
import Vector2 from '../utils/Vector2'
import { emptyTriangleMarkerId } from './EmptyTriangleMarker'

interface ErIsaHierarchyProps {
  erIsaHierarchy: ErIsaHierarchyModel
}

/**
 * Find a meeting point
 */
function getMeetingPoint(parentNode: ErNode, childrenNodes: ErNode[]): Vector2 {
  if (childrenNodes.length <= 0) {
    throw new Error('childrenNodes.length <= 0')
  }
  const parentCenter = new Vector2(parentNode.x, parentNode.y)
  const childCenter = childrenNodes
    .reduce((acc, childNode) => acc.add(new Vector2(childNode.x, childNode.y)), new Vector2(0, 0))
    .multiply(1 / childrenNodes.length)
  const difference = childCenter.subtract(parentCenter)
  return parentCenter.add(difference.multiply(0.4))
}

function ErIsaHierarchy({ erIsaHierarchy }: ErIsaHierarchyProps) {
  const parentNode = useStore((state: StoreModel) => state.diagram.nodes.find((x) => x.id === erIsaHierarchy.parent))
  const childrenNodes = useStore((state) => state.diagram.nodes.filter((x) => erIsaHierarchy.children.has(x.id)))
  if (!parentNode || childrenNodes.length <= 0) {
    // invalid ErIsaHierarchy
    // TODO: show error
    console.error('Invalid ErIsaHierarchy', erIsaHierarchy)
    return <></>
  }
  const meetingPoint = getMeetingPoint(parentNode, childrenNodes)
  return (
    <g strokeWidth={1} stroke='black'>
      <line
        key={`er-isa-hierarchy-${erIsaHierarchy.id}-parent-line`}
        markerEnd={`url(#${emptyTriangleMarkerId})`}
        x1={meetingPoint.x}
        y1={meetingPoint.y}
        x2={parentNode.x}
        y2={parentNode.y}></line>
      {childrenNodes.map((childNode) => (
        <line
          key={`er-isa-hierarchy-${erIsaHierarchy.id}-child-line-${childNode.id}`}
          x1={childNode.x}
          y1={childNode.y}
          x2={meetingPoint.x}
          y2={meetingPoint.y}></line>
      ))}
    </g>
  )
}

export default ErIsaHierarchy
