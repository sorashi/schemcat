import React, { useLayoutEffect, useRef, useState } from 'react'
import { Connection, ErNode as ErNodeModel, ErNodeType, Multiplicity, Rectangle } from '../model/DiagramModel'
import ErNode from './ErNode'
import SvgConnection from './SvgConnection'
import MovableSvgComponent from './MovableSvgComponent'
import { useStore } from '../hooks/useStore'
import { Draggable } from './Draggable'
import { Point } from '../model/Point'
import {
  arrayRotate,
  arrayRotated,
  BezierPathStringBuilder,
  clientToSvgCoordinates,
  normalizeRadiansAngle,
  Vector2,
} from '../utils/Utils'
// eslint-disable-next-line import/no-named-as-default
import produce from 'immer'
import { useDrop } from 'react-dnd'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { getShortcut, Modifier } from '../model/MenuModel'
import { plainToInstance } from 'class-transformer'
import { NodeContextMenu } from './Menu/NodeContextMenu'

interface DiagramProps {
  /** Whether this diagram is in the active tabset while also being the selected node in the tabset. */
  isSelectedNodeInActiveTabSet: boolean
}

function linkToPoints(fromNode: ErNodeModel, toNode: ErNodeModel) {
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

function MultiplicityText(props: { multiplicity: Multiplicity; x: number; y: number }) {
  const { multiplicity, x, y } = props
  const [textWidth, setTextWidth] = useState(0)
  const [textHeight, setTextHeight] = useState(0)
  const textRef = useRef<SVGTextElement>(null)
  useLayoutEffect(() => {
    if (textRef.current) {
      const { width, height } = textRef.current.getBBox()
      setTextWidth(width)
      setTextHeight(height)
    }
  }, [textRef])
  return (
    <text ref={textRef} x={x - textWidth / 2} y={y - textHeight / 2} dominantBaseline='central' textAnchor='middle'>
      {multiplicity.lowerBound}..{multiplicity.upperBound}
    </text>
  )
}

function DiagramConnection({ link }: { link: Connection }) {
  const from = useStore((state) => state.diagram.nodes.find((n) => n.id === link.fromId))
  const to = useStore((state) => state.diagram.nodes.find((n) => n.id === link.toId))
  const points = linkToPoints(from as ErNodeModel, to as ErNodeModel)
  return (
    <>
      <SvgConnection points={points} />
      <MultiplicityText multiplicity={link.multiplicity} x={points[1].x} y={points[1].y} />
    </>
  )
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

function Diagram({ isSelectedNodeInActiveTabSet = false }: DiagramProps) {
  const nodes = useStore((state) => state.diagram.nodes)
  const links = useStore((state) => state.diagram.links)
  const viewBox = useStore((state) => state.diagram.viewBox)
  const updateNodeById = useStore((state) => state.updateNodeById)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const removeNodeById = useStore((state) => state.removeNodeById)
  const selectedNodeIds = useStore((state) => state.diagram.selectedNodeIds)
  const isZoomPanSynced = useStore((state) => state.isZoomPanSynced)
  const [nodeContextMenuState, setNodeContextMenuState] = useState({
    show: false,
    location: Vector2.zero,
    nodeId: -1,
  })

  useKeyboardShortcut(getShortcut([], 'Delete'), () => {
    if (selectedNodeIds) {
      selectedNodeIds.forEach((id) => removeNodeById(id))
      updateDiagram((d) => d.selectedNodeIds.clear())
    }
  })
  useKeyboardShortcut(
    getShortcut([Modifier.Ctrl], 'l'),
    (e) => {
      if (selectedNodeIds.size !== 2) {
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
      updateDiagram((d) => d.links.push(new Connection(node1, node2, new Multiplicity(), true)))
    },
    [selectedNodeIds]
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

    function shouldPreventZoom(currentViewBox: Rectangle): boolean {
      const maxSize = 2500
      if ((currentViewBox.width > maxSize || currentViewBox.height > maxSize) && scaleDelta > 1) {
        // prevent zoom out
        return true
      }
      const minSize = 200
      if ((currentViewBox.width < minSize || currentViewBox.height < minSize) && scaleDelta < 1) {
        // prevent zoom in
        return true
      }
      return false
    }

    function updateViewBox(viewBox: Rectangle) {
      if (shouldPreventZoom(viewBox)) return
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
            e.target === svgRef.current && e.button === 0 && updateDiagram((d) => d.selectedNodeIds.clear())
          }
          preserveAspectRatio='xMidYMid meet'>
          {links.map((link) => (
            <DiagramConnection key={link.id} link={link} />
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
                    if (d.selectedNodeIds.has(node.id)) d.selectedNodeIds.delete(node.id)
                    else d.selectedNodeIds.add(node.id)
                  })
                } else {
                  updateDiagram((d) => {
                    d.selectedNodeIds.clear()
                    d.selectedNodeIds.add(node.id)
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
                selected={(selectedNodeIds.has && selectedNodeIds.has(node.id)) || false}
              />
            </MovableSvgComponent>,
            ...(node as ErNodeModel).identifiers
              .map((x) => nodes.filter((y) => x.includes(y.id)))
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
