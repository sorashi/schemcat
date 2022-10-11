import React, { useEffect } from "react"
import { useStore } from "../hooks/useStore"
import { ControlPanelViewType, DiagramNode, EnumTypeMetadataKey, ErNode, IncludeInControlPanelMetadata, IncludeInControlPanelMetadataKey } from "../model/DiagramNode"
import {v4 as uuidv4} from "uuid"
import { getEnumKeys } from "../utils/Utils"

function SimpleView(props: ControlPanelViewProps) {
    return <>
        {String(props.node[props.propertyKey])}
    </>
}

function TextEditView(props: ControlPanelViewProps) {
    const updateNodeById = useStore(state => state.updateNodeById)
    return <input type="text" defaultValue={String(props.node[props.propertyKey])}
        onChange={(e) => {updateNodeById(props.node.id, n =>
            (n as any)[props.propertyKey] = e.target.value
        )} }
    />
}

function ComboBoxView(props: ControlPanelViewProps) {
    const enumType = Reflect.getMetadata(EnumTypeMetadataKey, props.node, props.propertyKey)
    const updateNodeById = useStore(state => state.updateNodeById)
    return <select defaultValue={String(props.node[props.propertyKey])} onChange={(e) => updateNodeById(props.node.id, n => (n as any)[props.propertyKey] = e.target.value)}>
        {(getEnumKeys(enumType)).map((v) =>
            <option key={uuidv4()} value={String(v)}>{String(v)}</option>
        )}
    </select>
}

interface ControlPanelViewProps {
    metadata: IncludeInControlPanelMetadata
    node: DiagramNode,
    propertyKey: keyof DiagramNode
}

function ControlPanelView(props: ControlPanelViewProps) {
    switch(props.metadata.controlPanelViewType) {
    case ControlPanelViewType.ViewOnly:
        return <SimpleView {...props} />
    case ControlPanelViewType.TextEdit:
        return <TextEditView {...props} />
    case ControlPanelViewType.NumericUpDown:
        return <></>
    case ControlPanelViewType.ComboBox:
        return <ComboBoxView {...props} />
    default:
        // eslint-disable-next-line no-case-declarations
        const message = "Unknown ControlPanelViewType: " + props.metadata.controlPanelViewType
        console.error(message)
        return <span className="text-red-500">{message}</span>
    }
}

function ControlPanel() {
    const selectedNode = useStore(state => state.diagram.nodes.find(node => node.selected))
    const updateNodeById = useStore(state => state.updateNodeById)
    useEffect(() => {
        updateNodeById(1, node => node.selected = true)
    }, [])
    return (
        <div>
            <dl>
                {selectedNode && Reflect.ownKeys(selectedNode).map((prp) => {
                    const metadata: IncludeInControlPanelMetadata | undefined = Reflect.getMetadata(IncludeInControlPanelMetadataKey, selectedNode, prp as keyof typeof selectedNode)
                    if(metadata === undefined) return null
                    return <React.Fragment key={uuidv4()}>
                        <dt className="font-bold" key={uuidv4()}>{String(prp)}</dt>
                        <dd className="ml-4" key={uuidv4()}>
                            <ControlPanelView metadata={metadata} node={selectedNode} propertyKey={prp as keyof typeof selectedNode} />
                        </dd>
                    </React.Fragment>
                })}
            </dl>
        </div>
    )
}

export default ControlPanel