import { useEffect, useState } from "react"
import { ErNode as ErNodeModel } from "../model/DiagramNode"
import MovableSvgComponent from "./MovableSvgComponent"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: ErNodeModel
}

interface AnchorPoint {
    x: number,
    y: number,
}

const width = 90,
    height = 70

function ErNode(props: ErNodeProps) {

    function getErNodeTypeSvg(node: ErNodeModel) {
        switch (node.type) {
        case "Entity":
            return <rect width={width} height={height} fill="white" stroke="black" />
        case "Attribute":
            return <circle r={10} cx={5} cy={75 / 2} fill="white" stroke="black" />
        case "Relationship":
            return <SvgDiamondShape width={width} height={height} fill="white" stroke="black" />
        default:
            return <rect width={width} height={height} fill="white" stroke="black" />
        }
    }

    const { node } = props
    return (
        <>
            {getErNodeTypeSvg(node)}
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
