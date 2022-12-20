import { useCallback } from 'react'
import { useStore } from '../hooks/useStore'
import {
  ControlPanelViewType,
  DiagramNode,
  EnumTypeMetadataKey,
  ErNode,
  IncludeInControlPanelMetadata,
  IncludeInControlPanelMetadataKey,
} from '../model/DiagramModel'
import { plainToInstance } from 'class-transformer'

function SimpleView(props: ControlPanelViewProps) {
  return <>{String(props.node[props.propertyKey])}</>
}

function TextEditView(props: ControlPanelViewProps) {
  const updateNodeById = useStore((state) => state.updateNodeById)
  return (
    <input
      type='text'
      defaultValue={String(props.node[props.propertyKey])}
      onChange={(e) => {
        updateNodeById(
          props.node.id,
          (n) => ((n as Record<keyof DiagramNode, unknown>)[props.propertyKey] = e.target.value)
        )
      }}
    />
  )
}

function ComboBoxView(props: ControlPanelViewProps) {
  const enumType = Reflect.getMetadata(EnumTypeMetadataKey, props.node, props.propertyKey)
  const updateNodeById = useStore((state) => state.updateNodeById)
  return (
    <select
      defaultValue={String(props.node[props.propertyKey])}
      onChange={(e) =>
        updateNodeById(
          props.node.id,
          (n) => ((n as Record<keyof DiagramNode, unknown>)[props.propertyKey] = e.target.value)
        )
      }>
      {Object.values(enumType).map((v: unknown) => (
        <option key={`${props.node.id}: ${String(v)}`} value={String(v)}>
          {String(v)}
        </option>
      ))}
    </select>
  )
}

function NumericUpDownView(props: ControlPanelViewProps) {
  const updateNodeById = useStore((state) => state.updateNodeById)
  return (
    <input
      type='number'
      defaultValue={Number(props.node[props.propertyKey])}
      onChange={(e) =>
        updateNodeById(
          props.node.id,
          (n) => ((n as Record<keyof DiagramNode, unknown>)[props.propertyKey] = Number(e.target.value))
        )
      }
    />
  )
}

interface ControlPanelViewProps {
  metadata: IncludeInControlPanelMetadata
  node: DiagramNode
  propertyKey: keyof DiagramNode
}

function ControlPanelView(props: ControlPanelViewProps) {
  switch (props.metadata.controlPanelViewType) {
    case ControlPanelViewType.ViewOnly:
      return <SimpleView {...props} />
    case ControlPanelViewType.TextEdit:
      return <TextEditView {...props} />
    case ControlPanelViewType.NumericUpDown:
      return <NumericUpDownView {...props} />
    case ControlPanelViewType.ComboBox:
      return <ComboBoxView {...props} />
    default:
      // eslint-disable-next-line no-case-declarations
      const message = 'Unknown ControlPanelViewType: ' + props.metadata.controlPanelViewType
      console.error(message)
      return <span className='text-red-500'>{message}</span>
  }
}

function ControlPanel() {
  const selectedNodeIds = useStore((state) => state.diagram.selectedNodeIds)

  const selectedNodeId = selectedNodeIds.size === 1 ? selectedNodeIds.values().next().value : undefined
  const selectedNode = useStore(
    useCallback((state) => state.diagram.nodes.find((n) => n.id === selectedNodeId), [selectedNodeIds])
  )
  const convertedNode = plainToInstance(ErNode, selectedNode)
  return (
    <div className='p-2'>
      <dl>
        {(selectedNode &&
          convertedNode &&
          Reflect.ownKeys(selectedNode).map((prp) => {
            const metadata: IncludeInControlPanelMetadata | undefined = Reflect.getMetadata(
              IncludeInControlPanelMetadataKey,
              convertedNode,
              prp as keyof typeof selectedNode
            )
            if (metadata === undefined) return null
            return (
              <div key={`${selectedNodeId}-${String(prp)}`}>
                <dt className='font-bold'>{String(prp)}</dt>
                <dd className='ml-4'>
                  <ControlPanelView
                    key={`${selectedNodeId}-${String(prp)}`}
                    metadata={metadata}
                    node={convertedNode}
                    propertyKey={prp as keyof typeof selectedNode}
                  />
                </dd>
              </div>
            )
          })) || (
          <div className='text-gray-500'>
            {selectedNodeIds.size === 0 ? 'Select a node' : 'Multiple node editing is not supported yet'}
          </div>
        )}
      </dl>
    </div>
  )
}

export default ControlPanel
