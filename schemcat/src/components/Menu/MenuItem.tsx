import { MenuItem as MenuItemModel } from '../../model/MenuModel'
import { v4 as uuidv4 } from 'uuid'
import { Dropdown } from './Dropdown'
import React from 'react'

interface MenuItemProps {
  item: MenuItemModel
}

export function MenuItem(props: MenuItemProps) {
  const [dropdown, setDropdown] = React.useState(false)
  return (
    <li
      className='relative text-lg px-1 cursor-pointer border-collapse border-2 rounded-md border-gray-300 border-opacity-30 hover:border-opacity-100 hover:shadow-md'
      key={uuidv4()}
      onClick={() => setDropdown(!dropdown)}
      onMouseLeave={() => setDropdown(false)}>
      {props.item.title}
      {props.item.submenu && (
        <Dropdown
          dropdown={dropdown}
          item={props.item}
          submenu={false}></Dropdown>
      )}
    </li>
  )
}
