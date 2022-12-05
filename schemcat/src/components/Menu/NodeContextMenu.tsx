import { useCallback } from 'react'
import isEqual from 'react-fast-compare'
import { useStore } from '../../hooks/useStore'
import { ErNode, ErNodeType } from '../../model/DiagramModel'
import { MenuItem } from '../../model/MenuModel'
import { Vector2 } from '../../utils/Utils'
import { Dropdown } from './Dropdown'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

interface NodeContextMenuProps {
  location: Vector2
  nodeId: number
  onAfterAction?: () => void
}

export function NodeContextMenu({
  location,
  nodeId,
  onAfterAction,
}: NodeContextMenuProps) {
  const updateNodeById = useStore((state) => state.updateNodeById)
  const selectedNodeIds = useStore((state) => state.diagram.selectedNodeIds)
  const node: ErNode | undefined = useStore(
    useCallback(
      (state) => state.diagram.nodes.find((n) => n.id === nodeId),
      [nodeId]
    )
  ) as ErNode | undefined

  function handleAddRemoveIdentifier() {
    if (!node) return
    if (node.type === ErNodeType.AttributeType) {
      console.error('Cannot add/remove identifier to attribute')
      return
    }
    // ignore when no nodes are selected
    if (!selectedNodeIds || selectedNodeIds.size === 0) return
    const selectedNodeIdsWithoutSelf = new Set(selectedNodeIds)
    selectedNodeIdsWithoutSelf.delete(nodeId)
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

  const item: MenuItem = {
    title: 'Context Menu',
    submenu: [
      {
        title: 'Add/Remove as identifier',
        factory: (props: DropdownItemProps) => (
          <DropdownItem
            {...props}
            action={handleAddRemoveIdentifier}
            onAfterAction={() =>
              onAfterAction && onAfterAction()
            }></DropdownItem>
        ),
      },
    ],
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
      }}></Dropdown>
  )
}
