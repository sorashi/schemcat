import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { ErNode as ErNodeModel, ErNodeType } from "../model/DiagramModel"
import SvgDiamondShape from "./SvgDiamondShape"

interface ErNodeProps {
    node: ErNodeModel,
    height?: number,
    selected: boolean,
}

const width = 90, height = 70

const defaultNodeStyle = {
    fill: "white",
    stroke: "black",
}

const selectedNodeStyle = {
    stroke: "green",
    strokeDasharray: "3,3"
}

function ErNodeByType(props: ErNodeProps) {
    const {node, selected, height = 70} = props
    const { width } = node
    switch (node.type) {
    case ErNodeType.EntityType:
        // margin-y 10
        return <rect width={width} height={height + 20} y={-10} {...defaultNodeStyle} {...selected && selectedNodeStyle} />
    case ErNodeType.AttributeType:
        return <circle r={10} cx={5} cy={height / 2} {...defaultNodeStyle} {...selected && selectedNodeStyle} />
    case ErNodeType.RelationshipType:
        return <SvgDiamondShape width={width} height={height} {...defaultNodeStyle} {...selected && selectedNodeStyle} />
    default:
        console.error(`Unknown node type: ${node.type}`)
        return <rect width={width} height={height} {...defaultNodeStyle} />
    }
}

function ErNode(props: ErNodeProps) {
    const { node } = props
    const divRef = useRef<HTMLDivElement | null>(null)
    const [ foreignObjectHeight, setForeignObjectHeight ] = useState(height)
    useLayoutEffect(() => {
        if(divRef.current) {
            setForeignObjectHeight(divRef.current.offsetHeight)
        }
    }, [divRef, node.label, node.width])
    return (
        <>
            <ErNodeByType {...props} height={foreignObjectHeight} />
            <foreignObject x="0" y="0" width={props.node.width} height={foreignObjectHeight == 0 ? 1 : foreignObjectHeight} className="overflow-visible">
                <div ref={divRef} className="h-auto text-center w-full relative top-1/2 -translate-y-1/2">
                    <span>
                        {node.label}
                    </span>
                </div>
            </foreignObject>
        </>
    )
}

export default ErNode
