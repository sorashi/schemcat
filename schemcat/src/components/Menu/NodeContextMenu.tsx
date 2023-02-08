import { useCallback } from 'react'
import isEqual from 'react-fast-compare'
import { getIdentifiersByIds, useStore } from '../../hooks/useStore'
import { Connection, ErNode, ErNodeType, Cardinality, ErIdentifier } from '../../model/DiagramModel'
import { MenuItem } from '../../model/MenuModel'
import { isSubset } from '../../utils/SetOperations'
import { Dropdown } from './Dropdown'
import { DropdownItem } from './DropdownItem'
import Vector2 from '../../utils/Vector2'

interface NodeContextMenuProps {
  location: Vector2
  nodeId: number
  onAfterAction?: () => void
}

interface ContextMenuItemProps {
  nodeId: number
  onAfterAction?: () => void
}

function AddRemoveIdentifierDropdownItem({ nodeId, onAfterAction }: ContextMenuItemProps) {
  const updateNodeById = useStore((state) => state.updateNodeById)
  const addIdentifier = useStore((state) => state.addIdentifier)
  const removeIdentifierById = useStore((state) => state.removeIdentifierById)
  const selectedEntityIds = useStore((state) => state.diagram.selectedEntities)
  const identifiers = useStore((state) => state.diagram.identifiers)
  const node: ErNode | undefined = useStore(
    useCallback((state) => state.diagram.nodes.find((n) => n.id === nodeId), [nodeId])
  ) as ErNode | undefined

  const nodeIdentifiers = (node && getIdentifiersByIds(node.identifiers, identifiers)) || []

  const selectedNodeIdsWithSelf = new Set(
    selectedEntityIds.filter((selected) => selected.type === 'ErNode').map((selected) => selected.id)
  )
  const selectedNodeIdsWithoutSelf = new Set(selectedNodeIdsWithSelf)
  selectedNodeIdsWithoutSelf.delete(nodeId)

  function canAddOrRemoveIdentifier(): boolean {
    return (
      node?.type === ErNodeType.EntityType &&
      selectedEntityIds.every((selected) => selected.type === 'ErNode') &&
      selectedEntityIds.length >= 1
    )
  }

  function handleAddRemoveIdentifier() {
    if (!node) return
    if (node.type === ErNodeType.AttributeType) {
      console.error('Cannot add/remove identifier to attribute')
      return
    }
    // ignore when no nodes are selected
    if (!canAddOrRemoveIdentifier()) return
    const foundIdentifier = nodeIdentifiers.find((identifier) =>
      isEqual(identifier.identities, selectedNodeIdsWithoutSelf)
    )
    if (!foundIdentifier) {
      // add identifier
      if (nodeIdentifiers.some((identifier) => isSubset(selectedNodeIdsWithoutSelf, identifier.identities))) {
        alert(
          'A subset of an existing identifier cannot be added as an identifier. Please remove the larger identifier first.'
        )
        return
      }
      if (nodeIdentifiers.some((identifier) => isSubset(identifier.identities, selectedNodeIdsWithSelf))) {
        alert(
          'A superset of an existing identifier cannot be added as an identifier. Please remove the smaller identifier first.'
        )
        return
      }
      addIdentifier(new ErIdentifier(nodeId, selectedNodeIdsWithoutSelf, true))
    } else {
      // remove identifier
      removeIdentifierById(foundIdentifier.id)
    }
  }

  function getAddRemoveIdentifierTitle() {
    const neutral = 'Add/Remove as identifier'
    const add = 'Add as identifier'
    const remove = 'Remove from identifiers'
    if (!node) return neutral
    if (node.type === ErNodeType.AttributeType) return neutral
    if (!canAddOrRemoveIdentifier()) return neutral
    const foundIdentifier = nodeIdentifiers.find((identifier) =>
      isEqual(identifier.identities, selectedNodeIdsWithoutSelf)
    )
    if (!foundIdentifier) return add
    else return remove
  }

  return (
    <DropdownItem
      item={{ title: getAddRemoveIdentifierTitle() }}
      action={handleAddRemoveIdentifier}
      onAfterAction={() => onAfterAction && onAfterAction()}
      canDoAction={() => node?.type !== ErNodeType.AttributeType && selectedNodeIdsWithoutSelf.size > 0}></DropdownItem>
  )
}

function AddAttributeTypeDropdownItem({ nodeId, onAfterAction }: ContextMenuItemProps) {
  const updateDiagram = useStore((state) => state.updateDiagram)
  const node: ErNode | undefined = useStore(
    useCallback((state) => state.diagram.nodes.find((n) => n.id === nodeId), [nodeId])
  ) as ErNode | undefined

  function handleAddAttribute() {
    if (!node) return
    if (node.type !== ErNodeType.EntityType) {
      console.error('Adding attribute supported only for entities')
      return
    }
    const newAttribute: ErNode = new ErNode('Attribute', ErNodeType.AttributeType, node.x, node.y + 100, true)
    updateDiagram((d) => {
      d.nodes.push(newAttribute)
      d.links.push(new Connection(nodeId, newAttribute.id, new Cardinality(), true))
    })
  }

  return (
    <DropdownItem
      item={{ title: 'Add attribute type' }}
      action={handleAddAttribute}
      onAfterAction={() => onAfterAction && onAfterAction()}
      canDoAction={() => node?.type === ErNodeType.EntityType}></DropdownItem>
  )
}

export function NodeContextMenu({ location, nodeId, onAfterAction }: NodeContextMenuProps) {
  const item: MenuItem = {
    title: 'Context Menu',
    submenu: [],
  }
  return (
    <Dropdown
      dropdown={true}
      submenu={false}
      item={item}
      style={{
        left: location.x,
        top: location.y,
        position: 'fixed',
        zIndex: 50,
      }}>
      <AddRemoveIdentifierDropdownItem nodeId={nodeId} onAfterAction={onAfterAction} />
      <AddAttributeTypeDropdownItem nodeId={nodeId} onAfterAction={onAfterAction} />
    </Dropdown>
  )
}
