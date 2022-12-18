import { useCallback } from 'react'
import isEqual from 'react-fast-compare'
import { useStore } from '../../hooks/useStore'
import { Connection, ErNode, ErNodeType } from '../../model/DiagramModel'
import { MenuItem } from '../../model/MenuModel'
import { Vector2 } from '../../utils/Utils'
import { Dropdown } from './Dropdown'
import { DropdownItem } from './DropdownItem'

interface NodeContextMenuProps {
  location: Vector2
  nodeId: number
  onAfterAction?: () => void
}

interface ContextMenuItemProps {
  nodeId: number
  onAfterAction?: () => void
}
function AddRemoveIdentifierDropdownItem({
  nodeId,
  onAfterAction,
}: ContextMenuItemProps) {
  const updateNodeById = useStore((state) => state.updateNodeById)
  const selectedNodeIds = useStore((state) => state.diagram.selectedNodeIds)
  const node: ErNode | undefined = useStore(
    useCallback(
      (state) => state.diagram.nodes.find((n) => n.id === nodeId),
      [nodeId]
    )
  ) as ErNode | undefined

  const selectedNodeIdsWithoutSelf = new Set(selectedNodeIds)
  selectedNodeIdsWithoutSelf.delete(nodeId)

  function handleAddRemoveIdentifier() {
    if (!node) return
    if (node.type === ErNodeType.AttributeType) {
      console.error('Cannot add/remove identifier to attribute')
      return
    }
    // ignore when no nodes are selected
    if (!selectedNodeIds || selectedNodeIds.size === 0) return
    const index = node.identifiers.findIndex((id) =>
      isEqual(new Set(id), selectedNodeIdsWithoutSelf)
    )
    if (index === -1) {
      // add identifier
      updateNodeById(nodeId, (node) =>
        (node as ErNode).identifiers.push(
          Array.from(selectedNodeIdsWithoutSelf)
        )
      )
    } else {
      // remove identifier
      updateNodeById(nodeId, (node) =>
        (node as ErNode).identifiers.splice(index, 1)
      )
    }
  }
  function getAddRemoveIdentifierTitle() {
    const neutral = 'Add/Remove as identifier'
    const add = 'Add as identifier'
    const remove = 'Remove from identifiers'
    if (!node) return neutral
    if (node.type === ErNodeType.AttributeType) return neutral
    if (!selectedNodeIds || selectedNodeIds.size === 0) return neutral
    const index = node.identifiers.findIndex((id) =>
      isEqual(new Set(id), selectedNodeIdsWithoutSelf)
    )
    if (index === -1) return add
    else return remove
  }
  return (
    <DropdownItem
      item={{ title: getAddRemoveIdentifierTitle() }}
      action={handleAddRemoveIdentifier}
      onAfterAction={() => onAfterAction && onAfterAction()}
      canDoAction={() =>
        node?.type !== ErNodeType.AttributeType &&
        selectedNodeIdsWithoutSelf.size > 0
      }></DropdownItem>
  )
}

function AddAttributeTypeDropdownItem({
  nodeId,
  onAfterAction,
}: ContextMenuItemProps) {
  const updateDiagram = useStore((state) => state.updateDiagram)
  const node: ErNode | undefined = useStore(
    useCallback(
      (state) => state.diagram.nodes.find((n) => n.id === nodeId),
      [nodeId]
    )
  ) as ErNode | undefined

  function handleAddAttribute() {
    if (!node) return
    if (node.type !== ErNodeType.EntityType) {
      console.error('Adding attribute supported only for entities')
      return
    }
    const newAttribute: ErNode = new ErNode(
      'Attribute',
      ErNodeType.AttributeType,
      node.x,
      node.y + 100,
      true
    )
    updateDiagram((d) => {
      d.nodes.push(newAttribute)
      d.links.push(new Connection(nodeId, newAttribute.id, '', true))
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

export function NodeContextMenu({
  location,
  nodeId,
  onAfterAction,
}: NodeContextMenuProps) {
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
      <AddRemoveIdentifierDropdownItem
        nodeId={nodeId}
        onAfterAction={onAfterAction}
      />
      <AddAttributeTypeDropdownItem
        nodeId={nodeId}
        onAfterAction={onAfterAction}
      />
    </Dropdown>
  )
}
