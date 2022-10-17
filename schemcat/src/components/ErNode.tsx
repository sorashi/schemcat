import { ErNode as ErNodeModel, ErNodeType } from "../model/DiagramNode"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: ErNodeModel,
    selected: boolean,
}

const width = 90,
    height = 70

const selectedNodeStyle = {
    stroke: "green",
    strokeDasharray: "3,3"
}

function ErNodeByType(props: ErNodeProps) {
    const {node, selected} = props
    switch (node.type) {
    case ErNodeType.EntityType:
        return <rect width={width} height={height} fill="white" stroke="black" {...selected && selectedNodeStyle} />
    case ErNodeType.AttributeType:
        return <circle r={10} cx={5} cy={75 / 2} fill="white" stroke="black" {...selected && selectedNodeStyle} />
    case ErNodeType.RelationshipType:
        return <SvgDiamondShape width={width} height={height} fill="white" stroke="black" {...selected && selectedNodeStyle} />
    default:
        console.error(`Unknown node type: ${node.type}`)
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
