import React, { useCallback, useEffect, useRef, useState } from "react"
import { Connection, ErNode as ErNodeModel, ErNodeType } from "../model/DiagramModel"
import ErNode from "./ErNode"
import SvgConnection from "./SvgConnection"
import MovableSvgComponent from "./MovableSvgComponent"
import { useStore } from "../hooks/useStore"
import {v4 as uuidv4} from "uuid"

interface DiagramProps {
    width: number
    height: number,
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

function handleWheel(e: React.WheelEvent<SVGSVGElement>, svgRef: React.RefObject<SVGSVGElement>) {
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
    svg.viewBox.baseVal.width *= scaleDelta
    svg.viewBox.baseVal.height *= scaleDelta
    svg.viewBox.baseVal.x -= (startPoint.x - svg.viewBox.baseVal.x) * (scaleDelta - 1)
    svg.viewBox.baseVal.y -= (startPoint.y - svg.viewBox.baseVal.y) * (scaleDelta - 1)
}

function Diagram(props: DiagramProps) {
    const { width, height } = props
    const nodes = useStore(state => state.diagram.nodes)
    const links = useStore(state => state.diagram.links)
    const updateNodeById = useStore(state => state.updateNodeById)
    const updateDiagram = useStore(state => state.updateDiagram)
    const selectedNodeId = useStore(state => state.diagram.selectedNodeId)
    const svgRef = useRef(null)
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full cursor-move"
            ref={svgRef}
            onWheel={(e) => handleWheel(e, svgRef)}
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
    )
}

Diagram.defaultProps = {
    width: 800,
    height: 800,
}

export default Diagram
