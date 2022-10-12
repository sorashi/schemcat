import { useEffect, useState } from "react"
import { ErNode as ErNodeModel } from "../model/DiagramNode"
import MovableSvgComponent from "./MovableSvgComponent"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: ErNodeModel,
    selected: boolean,
}

interface AnchorPoint {
    x: number,
    y: number,
}

const width = 90,
    height = 70

function ErNodeByType(props: ErNodeProps) {
    const {node, selected} = props
    switch (node.type) {
    case "Entity":
        return <rect width={width} height={height} fill="white" stroke={selected ? "red" : "black"} />
    case "Attribute":
        return <circle r={10} cx={5} cy={75 / 2} fill="white" stroke={selected ? "red" : "black"} />
    case "Relationship":
        return <SvgDiamondShape width={width} height={height} fill="white" stroke={selected ? "red" : "black"} />
    default:
        return <rect width={width} height={height} fill="white"  />
    }
}

function ErNode(props: ErNodeProps) {
    const { node } = props
    return (
        <>
            <ErNodeByType {...props} />
            <foreignObject x="0" y="0" width={width} height={height} className="overflow-visible">
                <div className="h-full text-center w-auto" style={{ lineHeight: `${height}px` }}>
                    <span>
                        {node.label}
                    </span>
                </div>
            </foreignObject>
        </>
    )
}

export default ErNode
