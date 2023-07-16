import ErNode from './ErNode'
import {
  Anchor,
  Cardinality,
  Connection,
  ErIsaHierarchy,
  ErNode as ErNodeModel,
  ErNodeType,
  Rectangle,
} from '../model/DiagramModel'
import { useDrag } from 'react-dnd'
import { ErIsaHierarchyRaw } from '../components/ErIsaHierarchy'
import { PositionedSvgGroup } from './PositionedSvgGroup'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import { DndItemType } from '../Constants'
import { useStore } from '../hooks/useStore'
import SvgConnection from './SvgConnection'
import Vector2 from '../utils/Vector2'

interface DndConstructProps {
  name: string
  type: DndItemType
  action: (x: number, y: number) => void
  children: React.ReactNode
  viewBox: Rectangle | undefined
}
function DndPanelItem({ name, type, children, action, viewBox = undefined }: DndConstructProps) {
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
      <svg
        className='border border-gray-400, rounded-lg w-40 h-20'
        viewBox={(viewBox && viewBox.toString()) || '0 0 200 100'}>
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
DndPanelItem.defaultProps = { viewBox: undefined }

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
  const isaHierarchy = new ErIsaHierarchy(parent.id, [child1.id, child2.id], false)
  isaHierarchy.parentAnchor = Anchor.Bottom
  isaHierarchy.childrenAnchors.set(child1.id, Anchor.Top)
  isaHierarchy.childrenAnchors.set(child2.id, Anchor.Top)
  function action(x: number, y: number) {
    const parent = new ErNodeModel('Parent', ErNodeType.EntityType, x, y, true)
    const child1 = new ErNodeModel('Child1', ErNodeType.EntityType, x + 75, y + 100, true)
    const child2 = new ErNodeModel('Child2', ErNodeType.EntityType, x - 75, y + 100, true)
    const hierarchy = new ErIsaHierarchy(parent.id, [child1.id, child2.id], true)
    hierarchy.parentAnchor = Anchor.Bottom
    hierarchy.childrenAnchors.set(child1.id, Anchor.Top)
    hierarchy.childrenAnchors.set(child2.id, Anchor.Top)
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
        erIsaHierarchy={isaHierarchy}
        selected={false}></ErIsaHierarchyRaw>
    </DndPanelItem>
  )
}

function ErEntityTypeWithAttributesDndItem() {
  const updateDiagram = useStore((state) => state.updateDiagram)
  const entityType = new ErNodeModel('Entity Type', ErNodeType.EntityType, 50, 0, false)
  entityType.id = 0
  const attributes = []
  const attCount = 3
  const entityTypeBottom = entityType.getAnchorPoint(Anchor.Bottom) || new Vector2(entityType.x, entityType.y)
  for (let i = 0; i < attCount; i++) {
    const attribute = new ErNodeModel(`Attribute${i}`, ErNodeType.AttributeType, (300 / attCount) * i, 75, false)
    attribute.id = -i
    attributes.push(attribute)
  }
  function action(x: number, y: number) {
    const entityType = new ErNodeModel('Entity Type', ErNodeType.EntityType, x, y, true)
    const attributes: ErNodeModel[] = []
    const connections: Connection[] = []
    for (let i = 0; i < attCount; i++) {
      const att = new ErNodeModel(`Attribute${i}`, ErNodeType.AttributeType, i * 100 + x, 150 + y, true)
      attributes.push(att)
      const connection = new Connection(entityType.id, att.id, new Cardinality(), true)
      connection.fromAnchor = Anchor.Bottom
      connections.push(connection)
    }
    updateDiagram((d) => {
      d.nodes.push(entityType, ...attributes)
      d.links.push(...connections)
    })
  }
  return (
    <DndPanelItem
      name='Entity Type with Attributes'
      type='er'
      action={action}
      viewBox={new Rectangle(-30, -25, 325, 150)}>
      <PositionedSvgGroup x={entityType.x} y={entityType.y}>
        <ErNode node={entityType}></ErNode>
      </PositionedSvgGroup>
      {attributes.map((a) => (
        <>
          <SvgConnection points={[entityTypeBottom, a]} pathId={`path-${a.id}`}></SvgConnection>
          <PositionedSvgGroup x={a.x} y={a.y} key={`dnd-attribute-${a.id}`}>
            <ErNode node={a}></ErNode>
          </PositionedSvgGroup>
        </>
      ))}
    </DndPanelItem>
  )
}

function ErRelationshipWithEntityTypesDndItem() {
  const updateDiagram = useStore((state) => state.updateDiagram)
  const relationshipType = new ErNodeModel('Relationship Type', ErNodeType.RelationshipType, 20, 0, false)
  const entityType1 = new ErNodeModel('Entity Type 1', ErNodeType.EntityType, -75, 75, false)
  const entityType2 = new ErNodeModel('Entity Type 2', ErNodeType.EntityType, 150, -50, false)
  function action(x: number, y: number) {
    const relationshipType = new ErNodeModel('Relationship Type', ErNodeType.RelationshipType, x, y, true)
    const entityType1 = new ErNodeModel('Entity Type 1', ErNodeType.EntityType, x - 200, y + 75, true)
    const entityType2 = new ErNodeModel('Entity Type 2', ErNodeType.EntityType, x + 200, y - 50, true)
    const conn1 = new Connection(relationshipType.id, entityType1.id, new Cardinality(), true)
    conn1.fromAnchor = Anchor.BottomLeft
    conn1.toAnchor = Anchor.TopRight
    const conn2 = new Connection(relationshipType.id, entityType2.id, new Cardinality(), true)
    conn2.fromAnchor = Anchor.TopRight
    conn2.toAnchor = Anchor.BottomLeft
    updateDiagram((d) => {
      d.nodes.push(relationshipType, entityType1, entityType2)
      d.links.push(conn1, conn2)
    })
  }
  return (
    <DndPanelItem
      name='Relationship Type with participants'
      type='er'
      action={action}
      viewBox={new Rectangle(-100, -50, 350, 150)}>
      <PositionedSvgGroup x={relationshipType.x} y={relationshipType.y}>
        <ErNode node={relationshipType}></ErNode>
      </PositionedSvgGroup>
      <PositionedSvgGroup x={entityType1.x} y={entityType1.y}>
        <ErNode node={entityType1}></ErNode>
      </PositionedSvgGroup>
      <PositionedSvgGroup x={entityType2.x} y={entityType2.y}>
        <ErNode node={entityType2}></ErNode>
      </PositionedSvgGroup>
      <SvgConnection
        points={[
          relationshipType.getAnchorPoint(Anchor.BottomLeft) || relationshipType,
          entityType1.getAnchorPoint(Anchor.TopRight) || entityType1,
        ]}
        pathId='path-dnd-er-relationshiptype-with-entititytypes-1'></SvgConnection>
      <SvgConnection
        points={[
          relationshipType.getAnchorPoint(Anchor.TopRight) || relationshipType,
          entityType2.getAnchorPoint(Anchor.BottomLeft) || entityType2,
        ]}
        pathId='path-dnd-er-relationshiptype-with-entititytypes-2'></SvgConnection>
    </DndPanelItem>
  )
}

function ErRecursiveRelationshipType() {
  const updateDiagram = useStore((state) => state.updateDiagram)
  const relationshipType = new ErNodeModel('Relationship Type', ErNodeType.RelationshipType, 50, 0, false)
  const entityType1 = new ErNodeModel('Entity Type', ErNodeType.EntityType, -150, 0, false)
  function action(x: number, y: number) {
    const relationshipType = new ErNodeModel('Relationship Type', ErNodeType.RelationshipType, x, y, true)
    const entityType1 = new ErNodeModel('Entity Type 1', ErNodeType.EntityType, x - 200, y, true)
    const conn1 = new Connection(relationshipType.id, entityType1.id, new Cardinality(), true)
    conn1.fromAnchor = Anchor.TopLeft
    conn1.toAnchor = Anchor.TopRight
    const conn2 = new Connection(relationshipType.id, entityType1.id, new Cardinality(), true)
    conn2.fromAnchor = Anchor.BottomLeft
    conn2.toAnchor = Anchor.BottomRight
    updateDiagram((d) => {
      d.nodes.push(relationshipType, entityType1)
      d.links.push(conn1, conn2)
    })
  }
  return (
    <DndPanelItem
      name='Recursive Relationship Type'
      type='er'
      action={action}
      viewBox={new Rectangle(-175, -50, 350, 150)}>
      <PositionedSvgGroup x={relationshipType.x} y={relationshipType.y}>
        <ErNode node={relationshipType}></ErNode>
      </PositionedSvgGroup>
      <PositionedSvgGroup x={entityType1.x} y={entityType1.y}>
        <ErNode node={entityType1}></ErNode>
      </PositionedSvgGroup>
      <SvgConnection
        points={[
          relationshipType.getAnchorPoint(Anchor.TopLeft) || relationshipType,
          entityType1.getAnchorPoint(Anchor.TopRight) || entityType1,
        ]}
        pathId='path-dnd-er-relationshiptype-recursive-1'></SvgConnection>
      <SvgConnection
        points={[
          relationshipType.getAnchorPoint(Anchor.BottomLeft) || relationshipType,
          entityType1.getAnchorPoint(Anchor.BottomRight) || entityType1,
        ]}
        pathId='path-dnd-er-relationshiptype-recursive-2'></SvgConnection>
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
      <ErEntityTypeWithAttributesDndItem></ErEntityTypeWithAttributesDndItem>
      <ErRelationshipWithEntityTypesDndItem></ErRelationshipWithEntityTypesDndItem>
      <ErRecursiveRelationshipType></ErRecursiveRelationshipType>
    </div>
  )
}

export default DragAndDropPanel
