import React from 'react'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import {
  MenuItem as MenuItemModel,
  shortcutToString,
} from '../../model/MenuModel'
import { Dropdown } from './Dropdown'

export enum DropdownItemDisabledBehavior {
  /** The menu item is disabled meaning it is visible, but grayed out for example. */
  DISABLED,
  /** The menu item is not displayed when disabled. */
  HIDDEN,
}

export interface DropdownItemProps {
  item: MenuItemModel
  action?: () => void
  onAfterAction?: () => void
  /** If this returns `true`, the item is disabled according to {@link DropdownItemdisableBehavior} */
  canDoAction?: () => boolean
  disableBehavior?: DropdownItemDisabledBehavior
}

export function DropdownItem({
  item,
  action,
  onAfterAction,
  canDoAction,
  disableBehavior = DropdownItemDisabledBehavior.DISABLED,
}: DropdownItemProps) {
  const [dropdown, setDropdown] = React.useState(false)
  if (item.keyShortcut) {
    useKeyboardShortcut(item.keyShortcut, () => action && action())
  }
  const disabled = canDoAction && !canDoAction()
  const hide =
    disabled && disableBehavior === DropdownItemDisabledBehavior.HIDDEN
  const grayOut =
    disabled && disableBehavior === DropdownItemDisabledBehavior.DISABLED
  return (
    (!hide && (
      <li
        onClick={(e) => {
          setDropdown(!dropdown)
          if (action && !disabled) {
            action()
            if (onAfterAction) onAfterAction()
          }
          e.stopPropagation()
        }}
        onMouseEnter={() => setDropdown(true)}
        onMouseLeave={() => setDropdown(false)}
        className={`hover:bg-gray-200 px-2 cursor-pointer ${
          grayOut && 'text-gray-400'
        }`}>
        {item.title}
        {item.keyShortcut && (
          <span className='text-gray-400 text-sm ml-2'>
            {shortcutToString(item.keyShortcut)}
          </span>
        )}
        {item.submenu && (
          <Dropdown item={item} dropdown={dropdown} submenu={true}></Dropdown>
        )}
        {item.submenu && ' \u25B8'}
      </li>
    )) || <></>
  )
}
