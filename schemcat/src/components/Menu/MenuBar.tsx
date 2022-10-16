import { menuModel } from "../../model/MenuModel"
import { v4 as uuidv4 } from "uuid"
import { MenuItem } from "./MenuItem"

export function MenuBar() {
    return <ul className="flex flex-row flex-wrap items-center gap-1 py-1 px-2 my-0 mx-auto">
        { menuModel.map(item => <MenuItem key={uuidv4()} item={item} />) }
    </ul>
}