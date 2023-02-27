import { useCallback } from 'react'
import { getErEntityByDiscriminator, useStore } from '../hooks/useStore'
import {
  Anchor,
  Connection,
  ControlPanelViewType,
  EnumTypeMetadataKey,
  ErDiagramIdentityDiscriminator,
  ErIdentifier,
  ErIsaHierarchy,
  ErNode,
  IncludeInControlPanelMetadata,
  IncludeInControlPanelMetadataKey,
} from '../model/DiagramModel'
import { assertNever } from '../utils/Types'
import { AnchorPicker, enabledAnchorsCombinations } from './AnchorPicker'

type ErEntity = ErNode & Connection & ErIsaHierarchy & ErIdentifier
type ErEntityKey = keyof ErEntity
type ErEntityRecord = Record<ErEntityKey, unknown>

function SimpleView(props: ControlPanelViewProps) {
  const selectedEntity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  )
  return (selectedEntity && <>{String((selectedEntity as ErEntityRecord)[props.propertyKey])}</>) || <></>
}

function TextEditView(props: ControlPanelViewProps) {
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const selectedEntity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  )
  return (
    <input
      type='text'
      defaultValue={(selectedEntity && String((selectedEntity as ErEntity)[props.propertyKey])) || ''}
      onChange={(e) =>
        updateErEntityByDiscriminator(props.entity, (n) => ((n as ErEntityRecord)[props.propertyKey] = e.target.value))
      }
    />
  )
}

function ComboBoxView(props: ControlPanelViewProps) {
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const selectedEntity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  )
  const enumType =
    (selectedEntity && Reflect.getMetadata(EnumTypeMetadataKey, selectedEntity, props.propertyKey)) || undefined
  return (
    <select
      defaultValue={String((selectedEntity as ErEntity)[props.propertyKey])}
      onChange={(e) =>
        updateErEntityByDiscriminator(props.entity, (n) => ((n as ErEntityRecord)[props.propertyKey] = e.target.value))
      }>
      {(enumType &&
        Object.values(enumType).map((v: unknown) => (
          <option key={`${props.entity.id}: ${String(v)}`} value={String(v)}>
            {String(v)}
          </option>
        ))) || <option>enumType undefined</option>}
    </select>
  )
}

function NumericUpDownView(props: ControlPanelViewProps) {
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const selectedEntity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  )
  return (
    <input
      type='number'
      defaultValue={Number((selectedEntity as ErEntity)[props.propertyKey])}
      onChange={(e) =>
        updateErEntityByDiscriminator(
          props.entity,
          (n) => ((n as ErEntityRecord)[props.propertyKey] = Number(e.target.value))
        )
      }
    />
  )
}

function AnchorPickerView(props: ControlPanelViewProps) {
  const updateConnectionById = useStore((state) => state.updateConnectionById)
  const link = props.entity as unknown as Connection
  return (
    <AnchorPicker
      initialAnchor={link[props.propertyKey as keyof Connection] as Anchor}
      enabled={enabledAnchorsCombinations.all}
      onChanged={(anchor) =>
        updateConnectionById(
          link.id,
          (c) => ((c as Record<keyof Connection, unknown>)[props.propertyKey as keyof Connection] = anchor)
        )
      }
    />
  )
}

interface ControlPanelViewProps {
  metadata: IncludeInControlPanelMetadata
  entity: ErDiagramIdentityDiscriminator
  propertyKey: ErEntityKey
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
    case ControlPanelViewType.AnchorPicker:
      return <AnchorPickerView {...props} />
    default:
      // eslint-disable-next-line no-case-declarations
      const message = 'Unknown ControlPanelViewType: ' + props.metadata.controlPanelViewType
      console.error(message)
      assertNever(props.metadata.controlPanelViewType)
  }
}

function ControlPanelPropertyDescription({
  entityId,
  prp,
}: {
  entityId: ErDiagramIdentityDiscriminator
  prp: string | symbol
}) {
  const entity = useStore(useCallback((state) => getErEntityByDiscriminator(state, entityId), [entityId]))

  const connection = entity as Connection
  const nodeId = prp === 'fromAnchor' ? connection.fromId : connection.toId
  const nodeName = useStore((state) => state.diagram.nodes.find((n) => n.id === nodeId)?.label)
  return (
    <dt className='font-bold'>
      {(entityId.type === 'ErConnection' &&
        (prp === 'fromAnchor' || prp === 'toAnchor') &&
        `${String(prp)} (${nodeName})`) ||
        String(prp)}
    </dt>
  )
}

function ControlPanel() {
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)

  const selectedEntityId = selectedEntities.length === 1 ? selectedEntities[0] : undefined
  const selectedEntity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, selectedEntityId), [selectedEntityId])
  )
  return (
    <div className='p-2'>
      <dl>
        {(selectedEntityId &&
          selectedEntity &&
          Reflect.ownKeys(selectedEntity).map((prp) => {
            const metadata: IncludeInControlPanelMetadata | undefined = Reflect.getMetadata(
              IncludeInControlPanelMetadataKey,
              selectedEntity,
              prp as keyof typeof selectedEntity
            )
            if (metadata === undefined) return null
            return (
              <div key={`${selectedEntity}-${String(prp)}`}>
                <ControlPanelPropertyDescription entityId={selectedEntityId} prp={prp} />
                <dd className='ml-4'>
                  <ControlPanelView
                    key={`${selectedEntity}-${String(prp)}`}
                    metadata={metadata}
                    entity={selectedEntityId}
                    propertyKey={prp as keyof typeof selectedEntity}
                  />
                </dd>
              </div>
            )
          })) || (
          <div className='text-gray-500'>
            {selectedEntities.length === 0 ? 'Select a node' : 'Multiple node editing is not supported yet'}
          </div>
        )}
      </dl>
    </div>
  )
}

export default ControlPanel
