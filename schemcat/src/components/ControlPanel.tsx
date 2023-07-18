import React, { useCallback } from 'react'
import { getErEntityByDiscriminator, useStore } from '../hooks/useStore'
import {
  Anchor,
  Cardinality,
  CardinalityLowerBound,
  CardinalityUpperBound,
  Connection,
  ControlPanelViewType,
  EnumTypeMetadataKey,
  ErDiagramEntity,
  ErDiagramIdentityDiscriminator,
  ErIdentifier,
  ErIsaHierarchy,
  ErNode,
  ErNodeType,
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

function CardinalityView(props: ControlPanelViewProps) {
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const fetchedEntity = useStore((state) => getErEntityByDiscriminator(state, props.entity))
  const lowerBounds: CardinalityLowerBound[] = [CardinalityLowerBound.Zero, CardinalityLowerBound.One]
  const upperBounds: CardinalityUpperBound[] = [CardinalityUpperBound.One, CardinalityUpperBound.Many]
  const combinations = lowerBounds.flatMap((l) => upperBounds.map((u) => new Cardinality(l, u)))
  function boundsToString(bounds: Cardinality): string {
    return `${String(bounds.lowerBound)}..${String(bounds.upperBound)}`
  }
  const strToCardinality = new Map<string, Cardinality>()
  combinations.forEach((c) => strToCardinality.set(boundsToString(c), c))
  return (
    <select
      defaultValue={boundsToString((fetchedEntity as ErEntityRecord)[props.propertyKey] as Cardinality)}
      onChange={(e) =>
        updateErEntityByDiscriminator(
          props.entity,
          (n) => ((n as ErEntityRecord)[props.propertyKey] = strToCardinality.get(e.target.value))
        )
      }>
      {combinations.map((c) => (
        <option key={`${props.entity.id}: ${boundsToString(c)}`} value={boundsToString(c)}>
          {boundsToString(c)}
        </option>
      ))}
    </select>
  )
}

function AnchorPickerView(props: ControlPanelViewProps) {
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const entity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  ) as ErEntity

  return (
    <AnchorPicker
      initialAnchor={entity[props.propertyKey as keyof ErEntity] as Anchor}
      enabled={enabledAnchorsCombinations.all}
      onChanged={(anchor) =>
        updateErEntityByDiscriminator(
          props.entity,
          (c) => ((c as Record<keyof ErDiagramEntity, unknown>)[props.propertyKey as keyof ErDiagramEntity] = anchor)
        )
      }
    />
  )
}

function ChilrenAnchorsView(props: ControlPanelViewProps) {
  const entity = useStore(
    useCallback((state) => getErEntityByDiscriminator(state, props.entity), [props.entity])
  ) as ErIsaHierarchy
  const nodes = useStore((state) => state.diagram.nodes)
  const updateErEntityByDiscriminator = useStore((state) => state.updateErEntityByDiscriminator)
  const childrenAnchors = entity[props.propertyKey as keyof ErIsaHierarchy] as Map<number, Anchor>
  const keys: number[] = Array(...childrenAnchors.keys())
  keys.sort()
  return (
    <dl className='border border-gray-400 rounded p-2 w-fit'>
      {keys.map((k) => {
        const node = nodes.find((x) => x.id === k)
        return (
          <React.Fragment key={`children-anchors-view-anchor-picker-${k}`}>
            <dt>{node?.label || 'child'}</dt>
            <dd className='mb-3'>
              <AnchorPicker
                enabled={enabledAnchorsCombinations.all}
                onChanged={(anchor) =>
                  updateErEntityByDiscriminator(props.entity, (entity: ErDiagramEntity) => {
                    const isa = entity as ErIsaHierarchy
                    isa.childrenAnchors.set(k, anchor)
                  })
                }
                initialAnchor={childrenAnchors.get(k)}></AnchorPicker>
            </dd>
          </React.Fragment>
        )
      })}
    </dl>
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
    case ControlPanelViewType.Cardinality:
      return <CardinalityView {...props} />
    case ControlPanelViewType.ChildrenAnchors:
      return <ChilrenAnchorsView {...props} />
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
  metadata,
}: {
  entityId: ErDiagramIdentityDiscriminator
  prp: string | symbol
  metadata: IncludeInControlPanelMetadata | undefined
}) {
  const entity = useStore(useCallback((state) => getErEntityByDiscriminator(state, entityId), [entityId]))
  const nodes = useStore((state) => state.diagram.nodes)
  const properyLabel = metadata?.propertyLabel || String(prp)

  const connection = entity as Connection
  let propertyDescription = properyLabel
  switch (entityId.type) {
    case 'ErNode':
    case 'ErIdentifier':
      break
    case 'ErConnection': {
      if (prp !== 'fromAnchor' && prp !== 'toAnchor') break
      const nodeId = prp === 'fromAnchor' ? connection.fromId : connection.toId
      const nodeName = nodes.find((n) => n.id === nodeId)?.label
      propertyDescription = `${properyLabel} (${nodeName})`
      break
    }
    case 'ErIsaHierarchy': {
      if (prp !== 'parentAnchor') break
      const hierarchy = entity as ErIsaHierarchy
      const nodeId = hierarchy.parent
      const nodeName = nodes.find((n) => n.id === nodeId)?.label
      propertyDescription = `${properyLabel} (${nodeName})`
      break
    }
    default:
      assertNever(entityId.type)
  }
  return <dt className='font-bold'>{propertyDescription}</dt>
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
            if (prp === 'attributeTextPosition' && (selectedEntity as ErNode).type !== ErNodeType.AttributeType)
              return null
            return (
              <div key={`${selectedEntity.id}-${String(prp)}`}>
                <ControlPanelPropertyDescription metadata={metadata} entityId={selectedEntityId} prp={prp} />
                <dd className='ml-4'>
                  <ControlPanelView
                    key={`${selectedEntity.id}-${String(prp)}`}
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
