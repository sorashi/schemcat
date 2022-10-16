import React from "react"
import { MenuItem as MenuItemModel, shortcutToString } from "../../model/MenuModel"
import { Dropdown } from "./Dropdown"

interface DropdownItemProps {
    item: MenuItemModel
}

export function DropdownItem(props: DropdownItemProps) {
    const [dropdown, setDropdown] = React.useState(false)
    return <li onClick={e => {
        setDropdown(!dropdown)
        e.stopPropagation()
    }}
    onMouseEnter={() => setDropdown(true)}
    onMouseLeave={() => setDropdown(false)}
    className="hover:bg-gray-200 px-2">
        {props.item.title}
        {
            props.item.keyShortcut &&
            <span className="text-gray-400 text-sm ml-2">{shortcutToString(props.item.keyShortcut)}</span>
        }
        {
            props.item.submenu &&
            <Dropdown item={props.item} dropdown={dropdown} submenu={true}></Dropdown>
        }
        {
            props.item.submenu && " \u25B8"
        }
    </li>
}