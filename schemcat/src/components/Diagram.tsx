import React, { useLayoutEffect, useRef, useState } from 'react'
import {
  Connection,
  ErNode as ErNodeModel,
  ErNodeType,
  Cardinality,
  Rectangle,
  ErIdentifier,
} from '../model/DiagramModel'
import ErNode from './ErNode'
import MovableSvgComponent from './MovableSvgComponent'
import { useStore } from '../hooks/useStore'
import { Draggable } from './Draggable'
import { Point } from '../model/Point'
// eslint-disable-next-line import/no-named-as-default
import produce from 'immer'
import { useDrop } from 'react-dnd'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { getShortcut, Modifier } from '../model/MenuModel'
import { plainToInstance } from 'class-transformer'
import { NodeContextMenu } from './Menu/NodeContextMenu'
import Vector2 from '../utils/Vector2'
import BezierPathStringBuilder from '../utils/BezierPathStringBuilder'
import { arrayRotate, arrayRotated } from '../utils/Array'
import { normalizeRadiansAngle } from '../utils/Angle'
import { clientToSvgCoordinates } from '../utils/Svg'
import { DiagramConnection, linkToPoints } from './DiagramConnection'
import { assertNever } from '../utils/Types'

interface DiagramProps {
  /** Whether this diagram is in the active tabset while also being the selected node in the tabset. */
  isSelectedNodeInActiveTabSet: boolean
}

type IdentifiersToBezierReturnType = {
  path: string
  circle: Vector2
}

function identifiersToBezier(node: ErNodeModel, identifiers: ErNodeModel[]): IdentifiersToBezierReturnType {
  if (identifiers.length <= 1) return { path: '', circle: Vector2.zero }
  let connectionLocations = identifiers
    .map((id) => linkToPoints(node, id))
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

/**
 * Checks the current viewBox and determines whether further zoom-in or zoom-out is inadvisable.
 * That is, further zoom would either be too small or too large.
 * @param currentViewBox Current view rectangle.
 * @param scaleDelta The requested scale change. >1 means zoom-in, <1 means zoom-out.
 * @returns `true` iff further zoom-in or zoom-out is inadvisable
 */
function shouldPreventZoom(currentViewBox: Rectangle, scaleDelta: number): boolean {
  const maxSize = 2500
  const minSize = 200
  return (
    ((currentViewBox.width > maxSize || currentViewBox.height > maxSize) && scaleDelta > 1) ||
    ((currentViewBox.width < minSize || currentViewBox.height < minSize) && scaleDelta < 1)
  )
}

function Diagram({ isSelectedNodeInActiveTabSet = false }: DiagramProps) {
  const nodes = useStore((state) => state.diagram.nodes)
  const links = useStore((state) => state.diagram.links)
  const identifiers = useStore((state) => state.diagram.identifiers)
  const viewBox = useStore((state) => state.diagram.viewBox)
  const updateNodeById = useStore((state) => state.updateNodeById)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const removeNodeById = useStore((state) => state.removeNodeById)
  const selectedEntityIds = useStore((state) => state.diagram.selectedEntities)
  const isZoomPanSynced = useStore((state) => state.isZoomPanSynced)
  const [nodeContextMenuState, setNodeContextMenuState] = useState({
    show: false,
    location: Vector2.zero,
    nodeId: -1,
  })

  useKeyboardShortcut(getShortcut([], 'Delete'), () => {
    if (selectedEntityIds) {
      selectedEntityIds.forEach((selected) => {
        switch (selected.type) {
          case 'ErNode':
            removeNodeById(selected.id)
            break
          case 'ErIdentifier':
            updateDiagram((d) => {
              const index = d.identifiers.findIndex((i) => i.id === selected.id)
              if (index === -1) {
                console.error('Identifier for removal not found', selected.id)
                return
              }
              d.identifiers.splice(index, 1)
            })
            break
          case 'ErConnection':
            updateDiagram((d) => {
              const index = d.links.findIndex((l) => l.id === selected.id)
              if (index === -1) {
                console.error('Connection for removal not found', selected.id)
                return
              }
            })
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
  const [customViewBox, setCustomViewBox] = useState({ ...viewBox })
  const svgRef = useRef(null)

  function handleDragStart(_start: Point, target: EventTarget): boolean {
    if (svgRef.current === null) return true
    const svg: SVGSVGElement = svgRef.current
    if (svg !== target) return true
    setNodeContextMenuState({ ...nodeContextMenuState, show: false })
    setViewBoxOnDragStart({
      x: svg.viewBox.baseVal.x,
      y: svg.viewBox.baseVal.y,
    })
    return false
  }

  function handleDragging(start: Point, now: Point) {
    if (svgRef.current === null) return
    const svg: SVGSVGElement = svgRef.current
    const startPoint = clientToSvgCoordinates(start.x, start.y, svg)
    const endPoint = clientToSvgCoordinates(now.x, now.y, svg)

    function updateViewBox(viewBox: Rectangle) {
      viewBox.x = viewBoxOnDragStart.x - (endPoint.x - startPoint.x)
      viewBox.y = viewBoxOnDragStart.y - (endPoint.y - startPoint.y)
    }

    if (isZoomPanSynced) updateDiagram((d) => updateViewBox(d.viewBox))
    else setCustomViewBox(produce(updateViewBox))
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>, svgRef: React.RefObject<SVGSVGElement>) {
    // We cannot preventDefault() here, because wheel is a passive event listener.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    // The scrolling capability must be properly disabled in the style layer. See #13.
    const scaleFactor = 1.6
    const delta = e.deltaY || e.detail || 0
    const normalized = -(delta % 3 ? delta * 10 : delta / 3)
    const scaleDelta = normalized > 0 ? 1 / scaleFactor : scaleFactor
    if (svgRef.current === null) return
    const svg: SVGSVGElement = svgRef.current
    const p = svg.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const startPoint = p.matrixTransform(svg.getScreenCTM()?.inverse())

    function updateViewBox(viewBox: Rectangle) {
      if (shouldPreventZoom(viewBox, scaleDelta)) return
      viewBox.width *= scaleDelta
      viewBox.height *= scaleDelta
      viewBox.x -= (startPoint.x - svg.viewBox.baseVal.x) * (scaleDelta - 1)
      viewBox.y -= (startPoint.y - svg.viewBox.baseVal.y) * (scaleDelta - 1)
    }

    if (isZoomPanSynced) updateDiagram((d) => updateViewBox(d.viewBox))
    else setCustomViewBox(produce(updateViewBox))
  }

  useLayoutEffect(() => {
    if (!isZoomPanSynced) setCustomViewBox({ ...viewBox })
    if (isZoomPanSynced && isSelectedNodeInActiveTabSet) {
      // leader
      updateDiagram((d) => (d.viewBox = { ...customViewBox }))
    }
  }, [isZoomPanSynced])

  const [viewBoxOnDragStart, setViewBoxOnDragStart] = useState({
    x: 0,
    y: 0,
  })
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
      <Draggable onDragStart={handleDragStart} onDragging={handleDragging}>
        <svg
          viewBox={
            isZoomPanSynced
              ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
              : `${customViewBox.x} ${customViewBox.y} ${customViewBox.width} ${customViewBox.height}`
          }
          className='h-[100vh] w-[100vw] cursor-move'
          ref={svgRef}
          // zoom on mouse wheel
          onWheel={(e) => handleWheel(e, svgRef)}
          // cancel selection on SVG left click
          onClick={(e) =>
            e.target === svgRef.current && e.button === 0 && updateDiagram((d) => (d.selectedEntities = []))
          }
          preserveAspectRatio='xMidYMid meet'>
          {links.map((link) => (
            <DiagramConnection
              key={link.id}
              link={link}
              onClick={(e) => {
                if (e.ctrlKey) {
                  // add this one to selection
                } else {
                  // clear selection, select only this one
                  console.log('Click')
                }
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
                selected={selectedEntityIds.some((selected) => selected.id === node.id) || false}
              />
            </MovableSvgComponent>,
            ...Array.from((node as ErNodeModel).identifiers, (identifier) => {
              const found = identifiers.find((x) => x.id === identifier)
              if (!found) console.error('Identifier not found', identifier)
              return found
            })
              .filter((x): x is ErIdentifier => !!x)
              .map((x) => nodes.filter((y) => x.identities.has(y.id)))
              .map((identifiers) => {
                if (identifiers.length < 2) return
                const bezierResult = identifiersToBezier(node as ErNodeModel, identifiers as ErNodeModel[])
                return [
                  <path
                    key={`identifiers-bezier-${node.id}-${identifiers.map((x) => x.id).join(' ')}`}
                    fill='none'
                    stroke='black'
                    strokeWidth={1}
                    d={bezierResult.path}
                  />,
                  <circle
                    key={`identifiers-circle-${node.id}-${identifiers.map((x) => x.id).join(' ')}`}
                    cx={bezierResult.circle.x}
                    cy={bezierResult.circle.y}
                    r='10'
                    fill='black'
                  />,
                ]
              })
              .flat(),
          ])}
        </svg>
      </Draggable>
    </div>
  )
}

export default Diagram
