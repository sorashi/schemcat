import { ErNode as ErNodeModel } from "../model/DiagramNode"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: ErNodeModel,
    selected: boolean,
}

const width = 90,
    height = 70

const selectedNodeStyle = {
    stroke: "green",
    strokeDasharray: "10,10"
}

function ErNodeByType(props: ErNodeProps) {
    const {node, selected} = props
    switch (node.type) {
    case "Entity":
        return <rect width={width} height={height} fill="white" stroke="black" {...selected && selectedNodeStyle} />
    case "Attribute":
        return <circle r={10} cx={5} cy={75 / 2} fill="white" stroke="black" {...selected && selectedNodeStyle} />
    case "Relationship":
        return <SvgDiamondShape width={width} height={height} fill="white" stroke="black" {...selected && selectedNodeStyle} />
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
