import React from 'react'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import {
  MenuItem as MenuItemModel,
  shortcutToString,
} from '../../model/MenuModel'
import { Dropdown } from './Dropdown'

export interface DropdownItemProps {
  item: MenuItemModel
  action?: () => void
}

export function DropdownItem(props: DropdownItemProps) {
  const [dropdown, setDropdown] = React.useState(false)
  if (props.item.keyShortcut) {
    useKeyboardShortcut(
      props.item.keyShortcut,
      () => props.action && props.action()
    )
  }
  return (
    <li
      onClick={(e) => {
        setDropdown(!dropdown)
        if (props.action) props.action()
        e.stopPropagation()
      }}
      onMouseEnter={() => setDropdown(true)}
      onMouseLeave={() => setDropdown(false)}
      className='hover:bg-gray-200 px-2'>
      {props.item.title}
      {props.item.keyShortcut && (
        <span className='text-gray-400 text-sm ml-2'>
          {shortcutToString(props.item.keyShortcut)}
        </span>
      )}
      {props.item.submenu && (
        <Dropdown
          item={props.item}
          dropdown={dropdown}
          submenu={true}></Dropdown>
      )}
      {props.item.submenu && ' \u25B8'}
    </li>
  )
}
