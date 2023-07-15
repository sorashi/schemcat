import ErNode from './ErNode'
import { ErIsaHierarchy, ErNode as ErNodeModel, ErNodeType } from '../model/DiagramModel'
import { useDrag } from 'react-dnd'
import { useMemo } from 'react'
import ErIsaHierarchyComponent, { ErIsaHierarchyRaw } from '../components/ErIsaHierarchy'
import { PositionedSvgGroup } from './PositionedSvgGroup'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import { DndItemType } from '../Constants'
import { useStore } from '../hooks/useStore'

interface DragAndDropPanelItemProps {
  erNodeType: ErNodeType
}

interface DndConstructProps {
  name: string
  type: DndItemType
  action: (x: number, y: number) => void
  children: React.ReactNode
}
function DndPanelItem({ name, type, children, action }: DndConstructProps) {
  const [{ opacity }, dragRef] = useDrag(() => {
    return {
      type: type,
      item: { action: action },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      options: {
        dropEffect: 'copy', // cursor style
      },
    }
  }, [])
  return (
    <div ref={dragRef} className='w-auto h-auto' style={{ opacity }}>
      <svg className='border border-gray-400, rounded-lg w-40 h-20' viewBox='0 0 200 100'>
        <defs>
          <EmptyTriangleMarker></EmptyTriangleMarker>
          <TwoSidedMarker></TwoSidedMarker>
        </defs>
        {children}
      </svg>
      <p className='text-center text-sm text-gray-400 font-sans'>{name}</p>
    </div>
  )
}

interface ErNodeDndItemProps {
  nodeType: ErNodeType
  name: string
}

function PlainErNodeDndItem({ name, nodeType }: ErNodeDndItemProps) {
  const updateDiagram = useStore((state) => state.updateDiagram)
  return (
    <DndPanelItem
      name={name}
      type='er'
      action={(x, y) => {
        const node = new ErNodeModel(name, nodeType, x, y, true)
        updateDiagram((d) => d.nodes.push(node))
      }}>
      <PositionedSvgGroup x={50} y={25}>
        <ErNode node={new ErNodeModel(name, nodeType, 0, 0, false)} selected={false}></ErNode>
      </PositionedSvgGroup>
    </DndPanelItem>
  )
}

function IsaHierarchyDndItem() {
  const child1 = new ErNodeModel('Child1', ErNodeType.EntityType, 0, 70, false)
  child1.id = -1
  const child2 = new ErNodeModel('Child2', ErNodeType.EntityType, 100, 70, false)
  child2.id = -2
  const parent = new ErNodeModel('Parent', ErNodeType.EntityType, 50, 0, false)
  const updateDiagram = useStore((state) => state.updateDiagram)
  function action(x: number, y: number) {
    const parent = new ErNodeModel('Parent', ErNodeType.EntityType, x, y, true)
    const child1 = new ErNodeModel('Child1', ErNodeType.EntityType, x + 75, y + 100, true)
    const child2 = new ErNodeModel('Child2', ErNodeType.EntityType, x - 75, y + 100, true)
    const hierarchy = new ErIsaHierarchy(parent.id, [child1.id, child2.id], true)
    updateDiagram((d) => {
      d.nodes.push(parent, child1, child2)
      d.hierarchies.push(hierarchy)
    })
  }
  return (
    <DndPanelItem name='ISA Hierarchy' type='er' action={action}>
      <PositionedSvgGroup x={parent.x} y={parent.y}>
        <ErNode node={parent}></ErNode>
      </PositionedSvgGroup>
      <PositionedSvgGroup x={child1.x} y={child1.y}>
        <ErNode node={child1}></ErNode>
      </PositionedSvgGroup>
      <PositionedSvgGroup x={child2.x} y={child2.y}>
        <ErNode node={child2}></ErNode>
      </PositionedSvgGroup>
      <ErIsaHierarchyRaw
        parentNode={parent}
        childrenNodes={[child1, child2]}
        id={0}
        selected={false}></ErIsaHierarchyRaw>
    </DndPanelItem>
  )
}

function DragAndDropPanel() {
  return (
    <div className='flex flex-row flex-wrap gap-2 p-5'>
      <PlainErNodeDndItem name='Entity Type' nodeType={ErNodeType.EntityType}></PlainErNodeDndItem>
      <PlainErNodeDndItem name='Relationship Type' nodeType={ErNodeType.RelationshipType}></PlainErNodeDndItem>
      <PlainErNodeDndItem name='Attribute' nodeType={ErNodeType.AttributeType}></PlainErNodeDndItem>
      <IsaHierarchyDndItem></IsaHierarchyDndItem>
    </div>
  )
}

export default DragAndDropPanel
