import React, { useEffect, useRef, useState } from "react"
import { Connection, ErNode as ErNodeModel, ErNodeType } from "../model/DiagramModel"
import ErNode from "./ErNode"
import SvgConnection from "./SvgConnection"
import MovableSvgComponent from "./MovableSvgComponent"
import { useStore } from "../hooks/useStore"
import { Draggable } from "./Draggable"
import { Point } from "../model/Point"
import { clientToSvgCoordinates } from "../utils/Utils"
import produce from "immer"
import { useDrop } from "react-dnd"
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut"
import { getShortcut } from "../model/MenuModel"

interface DiagramProps {
    er: boolean
}

function linkToPoints(fromNode: ErNodeModel, toNode: ErNodeModel) {
    // The link could be deserialized from persisted data JSON. We must
    // assign the object to an instance of ErNodeModel to guarantee
    // existence of its methods. This could be improved by implementing a
    // custom deserializer.
    const { from, to } = { from: Object.assign(new ErNodeModel("", ErNodeType.EntityType), fromNode), to: Object.assign(new ErNodeModel("", ErNodeType.EntityType), toNode) }
    let fromAnchorPoints: {x:number, y:number}[] = []
    if(from.getAnchorPoints) fromAnchorPoints = from.getAnchorPoints()
    let toAnchorPoints: {x:number, y:number}[] = []
    if(to.getAnchorPoints) toAnchorPoints = to.getAnchorPoints()
    return [
        { x: fromAnchorPoints[0]?.x || from.x, y: fromAnchorPoints[0]?.y || from.y },
        { x: toAnchorPoints[0]?.x || to.x, y: toAnchorPoints[0]?.y || to.y },
    ]
}
function DiagramConnection(props: any) {
    const link: Connection = props.link
    const from = useStore(state => state.diagram.nodes.find(n => n.id === link.fromId))
    const to = useStore(state => state.diagram.nodes.find(n => n.id === link.toId))
    return <SvgConnection points={linkToPoints(from as ErNodeModel, to as ErNodeModel)} />
}


function Diagram(props: DiagramProps) {
    const nodes = useStore(state => state.diagram.nodes)
    const links = useStore(state => state.diagram.links)
    const viewBox = useStore(state => state.diagram.viewBox)
    const updateNodeById = useStore(state => state.updateNodeById)
    const updateDiagram = useStore(state => state.updateDiagram)
    const removeNodeById = useStore(state => state.removeNodeById)
    const selectedNodeId = useStore(state => state.diagram.selectedNodeId)
    const isZoomPanSynced = useStore(state => state.isZoomPanSynced)
    useKeyboardShortcut(getShortcut([], "Delete"), () => {
        if(selectedNodeId)  removeNodeById(selectedNodeId)
    })
    const [ customViewBox, setCustomViewBox ] = useState({...viewBox })
    const svgRef = useRef(null)
    function handleWheel(e: React.WheelEvent<SVGSVGElement>, svgRef: React.RefObject<SVGSVGElement>) {
    // We cannot preventDefault() here, because wheel is a passive event listener.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    // The scrolling capability must be properly disabled in the style layer. See #13.
        const scaleFactor = 1.6
        const delta = e.deltaY || e.detail || 0
        const normalized = -(delta % 3 ? delta * 10 : delta / 3)
        const scaleDelta = normalized > 0 ? 1 / scaleFactor : scaleFactor
        if(svgRef.current === null) return
        const svg: SVGSVGElement = svgRef.current
        const p = svg.createSVGPoint()
        p.x = e.clientX
        p.y = e.clientY
        const startPoint = p.matrixTransform(svg.getScreenCTM()?.inverse())
        if(props.er || isZoomPanSynced) {
            updateDiagram(d => {
                d.viewBox.width *= scaleDelta
                d.viewBox.height *= scaleDelta
                d.viewBox.x -= (startPoint.x - svg.viewBox.baseVal.x) * (scaleDelta - 1)
                d.viewBox.y -= (startPoint.y - svg.viewBox.baseVal.y) * (scaleDelta - 1)
            })
        }
        if(!props.er && !isZoomPanSynced) {
            setCustomViewBox(produce(draft => {
                draft.width *= scaleDelta
                draft.height *= scaleDelta
                draft.x -= (startPoint.x - svg.viewBox.baseVal.x) * (scaleDelta - 1)
                draft.y -= (startPoint.y - svg.viewBox.baseVal.y) * (scaleDelta - 1)
            }))
        }
    }

    useEffect(() => {
        if(!isZoomPanSynced) {
            setCustomViewBox({...viewBox})
        }
    }, [isZoomPanSynced])
    const [ viewBoxOnDragStart, setViewBoxOnDragStart ] = useState({ x: 0, y: 0 })
    const [, dropRef] = useDrop(() => ({
        accept: ["s"],
        drop: ({erNodeType}: { erNodeType: ErNodeType }, monitor) => {
            const { x, y } = monitor.getClientOffset() || { x: 0, y: 0 }
            const point = clientToSvgCoordinates(x, y, svgRef.current)
            const newNode = new ErNodeModel(erNodeType, erNodeType, point.x, point.y)
            updateDiagram(d => {
                d.nodes.push(newNode)
            })
            return newNode
        },
        // collect: monitor => ({ isOver: monitor.isOver(), item: monitor.getItem(), didDrop: monitor.didDrop(), result: monitor.getDropResult() }),
    }), [])
    return (
        <div className="w-full h-full overflow-hidden" ref={dropRef}>
            <Draggable
                onDragStart={(_start: Point, target: EventTarget) => {
                    if(svgRef.current === null) return true
                    const svg: SVGSVGElement = svgRef.current
                    if(svg !== target) return true
                    setViewBoxOnDragStart({ x: svg.viewBox.baseVal.x, y: svg.viewBox.baseVal.y })
                    return false
                }}
                onDragging={(start: Point, now: Point) => {
                    if(svgRef.current === null) return
                    const svg: SVGSVGElement = svgRef.current
                    const startPoint = clientToSvgCoordinates(start.x, start.y, svg)
                    const endPoint = clientToSvgCoordinates(now.x, now.y, svg)
                    if(props.er || isZoomPanSynced) {
                        updateDiagram(d => {
                            d.viewBox.x = viewBoxOnDragStart.x - (endPoint.x - startPoint.x)
                            d.viewBox.y = viewBoxOnDragStart.y - (endPoint.y - startPoint.y)
                        })
                    }
                    if(!props.er && !isZoomPanSynced) {
                        setCustomViewBox(produce(d => {
                            d.x = viewBoxOnDragStart.x - (endPoint.x - startPoint.x)
                            d.y = viewBoxOnDragStart.y - (endPoint.y - startPoint.y)
                        }))
                    }}}>
                <svg viewBox={
                    (props.er || isZoomPanSynced) ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
                        : `${customViewBox.x} ${customViewBox.y} ${customViewBox.width} ${customViewBox.height}`}
                className="h-[100vh] w-[100vw] cursor-move"
                ref={svgRef}
                // zoom on mouse wheel
                onWheel={(e) => handleWheel(e, svgRef)}
                // cancel selection on SVG left click
                onClick={(e) => e.target === svgRef.current && e.button === 0 && updateDiagram(d => d.selectedNodeId = undefined)}
                preserveAspectRatio="xMidYMid meet">
                    {links.map((link) => (
                        <DiagramConnection key={link.id} link={link} />
                    ))}
                    {nodes.map((node) => (
                        <MovableSvgComponent key={node.id} svgRef={svgRef} x={node.x} y={node.y} onDrag={(newX, newY) => {
                            updateNodeById(node.id, n => { n.x = newX, n.y = newY })
                        }}
                        onClick={() => {
                            updateDiagram(d => d.selectedNodeId = node.id)
                        }}>
                            <ErNode key={node.id} node={node as ErNodeModel} selected={node.id === selectedNodeId} />
                        </MovableSvgComponent>
                    ))}
                </svg>
            </Draggable>
        </div>
    )
}

Diagram.defaultProps = {
    er: false,
}

export default Diagram
