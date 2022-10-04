import React, { useEffect, useRef, useState } from "react"
import { Connection, DiagramModel, ErNode as ErNodeModel, ErNodeType } from "../model/DiagramNode"
import ErNode from "./ErNode"
import SvgConnection from "./SvgConnection"
import MovableSvgComponent from "./MovableSvgComponent"
import { useStore } from "../hooks/useStore"

interface DiagramProps {
    width: number
    height: number,
}
function Diagram(props: DiagramProps) {
    const { width, height } = props
    const diagram = useStore(state => state.diagram)
    const updateNode = useStore(state => state.updateNode)
    const refreshLinksFromToNode = useStore(state => state.refreshLinksFromToNode)
    const svgRef = useRef(null)
    function linkToPoints(link: Connection) {
        const { from, to } = link
        const fromAnchorPoints = from.getAnchorPoints!()
        const toAnchorPoints = to.getAnchorPoints!()
        return [
            { x: fromAnchorPoints[0]?.x || from.x, y: fromAnchorPoints[0]?.y || from.y },
            { x: toAnchorPoints[0]?.x || to.x, y: toAnchorPoints[0]?.y || to.y },
        ]
    }
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full" ref={svgRef}>
            {diagram.links.map((link) => (
                <SvgConnection key={link.id} points={linkToPoints(link)} />
            ))}
            {diagram.nodes.map((node) => (
                <MovableSvgComponent key={node.id} svgRef={svgRef} x={node.x} y={node.y} onDrag={(newX, newY) => {
                    updateNode({ ...(node as ErNodeModel), x: newX, y: newY, getAnchorPoints: node.getAnchorPoints! })
                    refreshLinksFromToNode(node as ErNodeModel)
                }}>
                    <ErNode key={node.id} node={node as ErNodeModel} />
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
