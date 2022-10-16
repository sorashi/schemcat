import { MenuItem as MenuItemModel } from "../../model/MenuModel"
import { v4 as uuidv4 } from "uuid"
import { DropdownItem } from "./DropdownItem"

interface DropdownProps {
    dropdown: boolean,
    submenu: boolean,
    item: MenuItemModel,
}

export function Dropdown(props: DropdownProps) {
    if(!props.item.submenu) throw new Error("Invalid props")
    return <ul
        className={`${props.dropdown ? "block" : "hidden"} bg-white absolute right-auto shadow-md z-50 min-w-max py-2 rounded-lg ${props.submenu ? "left-full top-0" : "left-0"}`}>
        {props.item.submenu.map(item =>
            <DropdownItem item={item} key={uuidv4()}></DropdownItem>
        )}
    </ul>
}