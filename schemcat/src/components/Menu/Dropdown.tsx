import { MenuItem as MenuItemModel } from '../../model/MenuModel'
import { v4 as uuidv4 } from 'uuid'
import { DropdownItem } from './DropdownItem'

interface DropdownProps {
  dropdown: boolean
  submenu: boolean
  item: MenuItemModel
  className?: string
  style?: React.CSSProperties
}

export function Dropdown({
  dropdown,
  submenu,
  item,
  className = '',
  style,
}: DropdownProps) {
  if (!item.submenu) throw new Error('Invalid props')
  return (
    <ul
      className={`${
        dropdown ? 'block' : 'hidden'
      } bg-white absolute right-auto shadow-md z-50 min-w-max py-2 rounded-lg ${
        submenu ? 'left-full top-0' : 'left-0'
      } ${className}`}
      style={style}>
      {item.submenu.map(
        (item) =>
          (item.factory && (
            <item.factory item={item} key={uuidv4()}></item.factory>
          )) || <DropdownItem item={item} key={uuidv4()}></DropdownItem>
      )}
    </ul>
  )
}
