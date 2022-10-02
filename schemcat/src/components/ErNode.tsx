import { State } from "@hookstate/core"
import { useEffect } from "react"
import { ErNode as ErNodeModel } from "../model/DiagramNode"
import MovableSvgComponent from "./MovableSvgComponent"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: State<ErNodeModel>
}

function ErNode(props: ErNodeProps) {
    const width = 75,
        height = 75

    function getErNodeTypeSvg(node: State<ErNodeModel>) {
        const nodeCopy = node.get()
        switch (nodeCopy.type) {
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
    useEffect(() => {
        switch (node.type.get()) {
        case "Entity":
            node.anchorPoints.set([{ x: node.x.get() + width / 2, y: node.y.get() }])
            break
        case "Attribute":
            node.anchorPoints.set([{ x: node.x.get() + 5, y: node.y.get() + 75 / 2 }])
            break
        case "Relationship":
            node.anchorPoints.set([{ x: node.x.get() + width / 2, y: node.y.get() }])
            break
        default:
            node.anchorPoints.set([{ x: node.x.get() + width / 2, y: node.y.get() }])
            break
        }
    }, [node.type])
    return (
        <MovableSvgComponent x={node.x.get()} y={node.y.get()}>
            {getErNodeTypeSvg(node)}
            <foreignObject x="0" y="0" width="75" height="75" className="overflow-visible">
                <div className="h-full text-center w-auto" style={{ lineHeight: `${height}px` }}>
                    <span>
                        <u>{node.label.get()}</u>
                    </span>
                </div>
            </foreignObject>
        </MovableSvgComponent>
    )
}

export default ErNode
