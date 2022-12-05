import { useCallback } from 'react'
import isEqual from 'react-fast-compare'
import { useStore } from '../../hooks/useStore'
import { Connection, ErNode, ErNodeType } from '../../model/DiagramModel'
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
  const updateDiagram = useStore((state) => state.updateDiagram)
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

  const item: MenuItem = {
    title: 'Context Menu',
    submenu: [
      {
        title: 'Add/Remove as identifier',
        factory: (props: DropdownItemProps) => (
          <DropdownItem
            {...props}
            action={handleAddRemoveIdentifier}
            onAfterAction={() => onAfterAction && onAfterAction()}
            canDoAction={() =>
              node?.type !== ErNodeType.AttributeType &&
              selectedNodeIdsWithoutSelf.size > 0
            }
          />
        ),
      },
      {
        title: 'Add attribute type',
        factory: (props: DropdownItemProps) => (
          <DropdownItem
            {...props}
            action={handleAddAttribute}
            onAfterAction={() => onAfterAction && onAfterAction()}
            canDoAction={() =>
              node?.type === ErNodeType.EntityType
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
