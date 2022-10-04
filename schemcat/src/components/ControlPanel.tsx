import React, { useEffect } from "react"
import { useStore } from "../hooks/useStore"
import { DiagramNode, ErNode } from "../model/DiagramNode"
import {v4 as uuidv4} from "uuid"


function ControlPanel() {
    const diagram = useStore(state => state.diagram)
    const selectedNode = diagram.nodes.find(node => node.selected)
    const updateNode = useStore(state => state.updateNode)
    useEffect(() => {
        updateNode({ ...diagram.nodes[0], selected: true, getAnchorPoints: diagram.nodes[0].getAnchorPoints! } as ErNode)
    }, [])
    return (
        <div>
            <dl>
                {selectedNode && Reflect.ownKeys(selectedNode).map((prp) => {
                    if(typeof selectedNode[prp as keyof typeof selectedNode] === "function") {
                        return null
                    }
                    return <React.Fragment key={uuidv4()}>
                        <dt className="font-bold" key={uuidv4()}>{String(prp)}</dt>
                        <dd className="ml-7" key={uuidv4()}>{String(selectedNode[prp as keyof typeof selectedNode])}</dd>
                    </React.Fragment>
                })}
            </dl>
        </div>
    )
}

export default ControlPanel