import React, { useEffect, useState } from "react"
import { hookstate, State, useHookstate, DevTools } from "@hookstate/core"
import { Connection, DiagramModel, ErNode as ErNodeModel, ErNodeType } from "../model/DiagramNode"
import ErNode from "./ErNode"
import SvgConnection from "./SvgConnection"

interface DiagramProps {
    width: number
    height: number
}
const exampleDiagram = new DiagramModel()
exampleDiagram.nodes = [
    new ErNodeModel("Person", ErNodeType.Entity, 20, 1), //0
    new ErNodeModel("name", ErNodeType.Attribute, 20, 100), //1
    new ErNodeModel("age", ErNodeType.Attribute, 100, 100), //2
    new ErNodeModel("Team", ErNodeType.Entity, 20, 200), //3
    new ErNodeModel("name", ErNodeType.Attribute, 20, 300), //4
    new ErNodeModel("member", ErNodeType.Relationship, 200, 150), //5
]
exampleDiagram.links = [
    new Connection(exampleDiagram.nodes[0], exampleDiagram.nodes[1], "0..1"),
    new Connection(exampleDiagram.nodes[0], exampleDiagram.nodes[2], "0..1"),
    new Connection(exampleDiagram.nodes[3], exampleDiagram.nodes[4], "0..1"),
    new Connection(exampleDiagram.nodes[0], exampleDiagram.nodes[5], "0..*"),
    new Connection(exampleDiagram.nodes[3], exampleDiagram.nodes[5], "0..*"),
]
function Diagram(props: DiagramProps) {
    const { width, height } = props
    DevTools(diagram).label("diagram")
    const diagram = useHookstate(exampleDiagram)
    function linkToPoints(link: Connection) {
        const { from, to } = link
        return [
            { x: from.anchorPoints[0]?.x || from.x, y: from.anchorPoints[0]?.y || from.y },
            { x: to.anchorPoints[0]?.x || to.x, y: to.anchorPoints[0]?.y || to.y },
        ]
    }
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full">
            {diagram.links.map((link) => (
                <SvgConnection key={link.id.get()} points={linkToPoints(link.get())} />
            ))}
            {diagram.nodes.map((node) => (
                <ErNode key={node.id.get()} node={node as unknown as State<ErNodeModel>} />
            ))}
        </svg>
    )
}

Diagram.defaultProps = {
    width: 800,
    height: 800,
}

export default Diagram
