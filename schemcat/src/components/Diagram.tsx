import React, { useRef, useState } from 'react'
import { Connection, ErNode as ErNodeModel, ErNodeType, Cardinality, ErIdentifier } from '../model/DiagramModel'
import ErNode from './ErNode'
import MovableSvgComponent from './MovableSvgComponent'
import { useStore } from '../hooks/useStore'
import { useDrop } from 'react-dnd'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { getShortcut, Modifier } from '../model/MenuModel'
import { NodeContextMenu } from './Menu/NodeContextMenu'
import Vector2 from '../utils/Vector2'
import BezierPathStringBuilder from '../utils/BezierPathStringBuilder'
import { arrayRotate, arrayRotated } from '../utils/Array'
import { normalizeRadiansAngle } from '../utils/Angle'
import { clientToSvgCoordinates } from '../utils/Svg'
import { DiagramConnection, linkToPoints } from './DiagramConnection'
import { assertNever } from '../utils/Types'
import { EmptyTriangleMarker } from './Markers'
import ErIsaHierarchy from './ErIsaHierarchy'
import PannableZoomableSvg from './PannableZoomableSvg'

interface DiagramProps {
  /** Whether this diagram is in the active tabset while also being the selected node in the tabset. */
  isSelectedNodeInActiveTabSet: boolean
}

type IdentifiersToBezierReturnType = {
  path: string
  circle: Vector2
}

function identifiersToBezier(
  node: ErNodeModel,
  identifiers: ErNodeModel[],
  links: Connection[]
): IdentifiersToBezierReturnType {
  if (identifiers.length <= 1) return { path: '', circle: Vector2.zero }
  let connectionLocations = identifiers
    .map((id) => {
      // find the link between the node and the identifier
      const link = links.find((l) => l.fromId === node.id && l.toId === id.id)
      if (!link)
        throw new Error(`Could not find link between ${node.id} and ${id.id} for bezier rendering of an identifier.`)
      return linkToPoints(link, node, id)
    })
    .map((points) => ({
      from: new Vector2(points[0].x, points[0].y),
      to: new Vector2(points[1].x, points[1].y),
    }))
  // sort by counter-clockwise angle
  connectionLocations = connectionLocations.sort((a, b) => {
    const angleA = normalizeRadiansAngle(a.to.subtract(a.from).angle())
    const angleB = normalizeRadiansAngle(b.to.subtract(b.from).angle())
    return angleA - angleB
  })
  // find best array rotation by angle sum
  let minAchieved = Infinity
  let bestRotation = 0
  for (let i = 0; i < connectionLocations.length; i++) {
    const rotated = arrayRotated(connectionLocations, i)
    let sum = 0
    for (let j = 0; j < rotated.length - 1; j++) {
      const angleA = normalizeRadiansAngle(rotated[j].to.subtract(rotated[j].from).angle())
      const angleB = normalizeRadiansAngle(rotated[j + 1].to.subtract(rotated[j + 1].from).angle())
      sum += normalizeRadiansAngle(angleB - angleA)
    }
    if (sum < minAchieved) {
      minAchieved = sum
      bestRotation = i
    }
  }
  // apply the found best rotation
  arrayRotate(connectionLocations, bestRotation)

  const connectionVectors = connectionLocations.map((loc) => loc.to.subtract(loc.from))
  const bezierStartShift = (v: Vector2) => v.rotate(-90).normalize().multiply(20)
  const bezierEndShift = (v: Vector2) => v.rotate(90).normalize().multiply(20)
  const t = 0.7

  const bezier = new BezierPathStringBuilder()

  const bezierStart = connectionLocations[0].from
    .add(connectionVectors[0].multiply(t))
    .add(bezierStartShift(connectionVectors[0]))

  bezier.addFirstBezier(
    bezierStart,
    bezierStart.add(connectionVectors[0].rotate(60).normalize().multiply(30)),
    connectionLocations[1].from
      .add(connectionVectors[1].multiply(t))
      .add(connectionLocations.length == 2 ? bezierEndShift(connectionVectors[1]) : Vector2.zero)
      .add(connectionVectors[1].rotate(-60).normalize().multiply(30)),
    connectionLocations[1].from
      .add(connectionVectors[1].multiply(t))
      .add(connectionLocations.length == 2 ? bezierEndShift(connectionVectors[1]) : Vector2.zero)
  )
  for (let i = 2; i < connectionLocations.length; i++) {
    bezier.addReflectedBezier(
      connectionLocations[i].from
        .add(connectionVectors[i].multiply(t))
        .add(i == connectionLocations.length - 1 ? bezierEndShift(connectionVectors[i]) : Vector2.zero)
        .add(connectionVectors[i].rotate(-60).normalize().multiply(30)),
      connectionLocations[i].from.add(
        connectionVectors[i]
          .multiply(t)
          .add(i == connectionLocations.length - 1 ? bezierEndShift(connectionVectors[i]) : Vector2.zero)
      )
    )
  }
  return {
    path: bezier.toString(),
    circle: bezierStart,
  }
}

function Diagram({ isSelectedNodeInActiveTabSet: isSelectedNodeInActiveTabSet = false }: DiagramProps) {
  const nodes = useStore((state) => state.diagram.nodes)
  const links = useStore((state) => state.diagram.links)
  const identifiers = useStore((state) => state.diagram.identifiers)
  const hierarchies = useStore((state) => state.diagram.hierarchies)
  const updateNodeById = useStore((state) => state.updateNodeById)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const removeNodeById = useStore((state) => state.removeNodeById)
  const removeIdentifierById = useStore((state) => state.removeIdentifierById)
  const selectedEntityIds = useStore((state) => state.diagram.selectedEntities)
  const [nodeContextMenuState, setNodeContextMenuState] = useState({
    show: false,
    location: Vector2.zero,
    nodeId: -1,
  })

  useKeyboardShortcut(getShortcut([], 'Delete'), () => {
    console.log('Deleting', selectedEntityIds)
    if (selectedEntityIds) {
      selectedEntityIds.forEach((selected) => {
        switch (selected.type) {
          case 'ErNode':
            removeNodeById(selected.id)
            break
          case 'ErIdentifier':
            removeIdentifierById(selected.id)
            break
          case 'ErConnection':
            updateDiagram((d) => {
              const index = d.links.findIndex((l) => l.id === selected.id)
              if (index === -1) {
                console.error('Connection for removal not found', selected.id)
                return
              }
              d.links.splice(index, 1)
            })
            break
          case 'ErIsaHierarchy':
            updateDiagram((d) => (d.hierarchies = d.hierarchies.filter((h) => h.id !== selected.id)))
            break
          default:
            return assertNever(selected.type)
        }
      })
      updateDiagram((d) => (d.selectedEntities = []))
    }
  })
  useKeyboardShortcut(
    getShortcut([Modifier.Ctrl], 'l'),
    (e) => {
      const selectedNodeIds = selectedEntityIds.filter((e) => e.type === 'ErNode').map((e) => e.id)
      if (selectedNodeIds.length !== 2) {
        console.error('not supported yet')
        return
      }
      const [node1, node2] = selectedNodeIds
      e.preventDefault()
      let existing: number
      if (
        (existing = links.findIndex(
          (l) => (l.fromId === node1 && l.toId === node2) || (l.fromId === node2 && l.toId === node1)
        )) !== -1
      ) {
        updateDiagram((d) => d.links.splice(existing, 1))
        return
      }
      updateDiagram((d) => d.links.push(new Connection(node1, node2, new Cardinality(), true)))
    },
    [selectedEntityIds]
  )

  const svgRef = useRef(null)

  const [, dropRef] = useDrop(
    () => ({
      accept: ['s'],
      drop: ({ erNodeType }: { erNodeType: ErNodeType }, monitor) => {
        const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 }
        const point = clientToSvgCoordinates(x, y, svgRef.current)
        const newNode = new ErNodeModel(erNodeType, erNodeType, point.x, point.y, true)
        updateDiagram((d) => {
          d.nodes.push(newNode)
        })
        return newNode
      },
      // collect: monitor => ({ isOver: monitor.isOver(), item: monitor.getItem(), didDrop: monitor.didDrop(), result: monitor.getDropResult() }),
    }),
    []
  )
  return (
    <div className='w-full h-full overflow-hidden' ref={dropRef}>
      {nodeContextMenuState.show && (
        <NodeContextMenu
          location={nodeContextMenuState.location}
          nodeId={nodeContextMenuState.nodeId}
          onAfterAction={() => setNodeContextMenuState({ ...nodeContextMenuState, show: false })}></NodeContextMenu>
      )}
      <PannableZoomableSvg
        isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabSet}
        onDragStart={() => setNodeContextMenuState({ ...nodeContextMenuState, show: false })}
        onLeftClick={(e) => {
          updateDiagram((d) => (d.selectedEntities = []))
        }}
        svgRef={svgRef}>
        <defs>
          <EmptyTriangleMarker />
        </defs>
        {hierarchies.map((hierarchy) => (
          <ErIsaHierarchy
            key={`er-isa-hierarchy-${hierarchy.id}`}
            erIsaHierarchy={hierarchy}
            onClick={(e) => {
              if (e.ctrlKey) {
                if (selectedEntityIds.some((x) => x.id === hierarchy.id)) {
                  // remove from selection
                  updateDiagram((d) => {
                    d.selectedEntities = d.selectedEntities.filter((x) => x.id !== hierarchy.id)
                  })
                  return
                }
                // add to selection
                updateDiagram((d) => {
                  d.selectedEntities.push({ id: hierarchy.id, type: 'ErIsaHierarchy' })
                })
                return
              }
              // clear the selection, select only this one
              updateDiagram((d) => (d.selectedEntities = [{ id: hierarchy.id, type: 'ErIsaHierarchy' }]))
            }}
          />
        ))}
        {links.map((link) => (
          <DiagramConnection
            key={link.id}
            link={link}
            onClick={(e) => {
              if (e.ctrlKey) {
                if (selectedEntityIds.some((x) => x.id === link.id)) {
                  // remove from selection
                  updateDiagram((d) => {
                    d.selectedEntities = d.selectedEntities.filter((x) => x.id !== link.id)
                  })
                  return
                }
                // add to selection
                updateDiagram((d) => {
                  d.selectedEntities.push({ id: link.id, type: 'ErConnection' })
                })
                return
              }
              // clear the selection, select only this one
              updateDiagram((d) => (d.selectedEntities = [{ id: link.id, type: 'ErConnection' }]))
            }}
          />
        ))}
        {nodes.map((node) => [
          <MovableSvgComponent
            key={node.id}
            svgRef={svgRef}
            x={node.x}
            y={node.y}
            onDrag={(newX, newY) => {
              updateNodeById(node.id, (n) => {
                ;(n.x = newX), (n.y = newY)
              })
            }}
            onClick={(e) => {
              if (e.ctrlKey) {
                updateDiagram((d) => {
                  const foundIndex = d.selectedEntities.findIndex((selected) => selected.id === node.id)
                  if (foundIndex >= 0) d.selectedEntities.splice(foundIndex, 1)
                  else d.selectedEntities.push({ id: node.id, type: 'ErNode' })
                })
              } else {
                updateDiagram((d) => {
                  d.selectedEntities = [{ id: node.id, type: 'ErNode' }]
                })
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              setNodeContextMenuState({
                ...nodeContextMenuState,
                location: new Vector2(e.clientX, e.clientY),
                show: !nodeContextMenuState.show,
                nodeId: node.id,
              })
            }}>
            <ErNode
              key={node.id}
              node={node as ErNodeModel}
              selected={
                selectedEntityIds.some((selected) => selected.id === node.id && selected.type === 'ErNode') || false
              }
            />
          </MovableSvgComponent>,
          ...Array.from((node as ErNodeModel).identifiers, (identifier) => {
            const found = identifiers.find((x) => x.id === identifier)
            if (!found) console.error('Identifier not found', identifier)
            return found
          })
            .filter((x): x is ErIdentifier => !!x)
            .map((x) => ({ identifierId: x.id, identifiers: nodes.filter((y) => x.identities.has(y.id)) }))
            .map((identifierInfo) => {
              const { identifiers, identifierId } = identifierInfo
              if (identifiers.length < 2) return
              const bezierResult = identifiersToBezier(node as ErNodeModel, identifiers as ErNodeModel[], links)
              const style: React.CSSProperties | undefined = selectedEntityIds.some((x) => x.id === identifierId)
                ? {
                    stroke: 'green',
                    strokeDasharray: '5,5',
                  }
                : undefined
              const selectOnClick = (e: React.MouseEvent<SVGElement>) => {
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
              return [
                // this path is the "hitbox", i.e. what the user can click to select the path
                <path
                  key={`identifiers-bezier-hitbox-${identifierId}}`}
                  fill='none'
                  stroke='rgba(255,0,0,0)'
                  strokeWidth={10}
                  d={bezierResult.path}
                  onClick={selectOnClick}
                />,
                <path
                  key={`identifiers-bezier-${identifierId}`}
                  fill='none'
                  stroke='black'
                  strokeWidth={1}
                  style={style}
                  d={bezierResult.path}
                />,
                <circle
                  key={`identifiers-circle-${identifierId}`}
                  cx={bezierResult.circle.x}
                  cy={bezierResult.circle.y}
                  r={7}
                  fill='black'
                  style={style}
                  onClick={selectOnClick}
                />,
              ]
            })
            .flat(),
        ])}
      </PannableZoomableSvg>
    </div>
  )
}

export default Diagram
