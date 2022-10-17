import { useTemporalStore } from "../../hooks/useStore"
import { DropdownItem, DropdownItemProps } from "./DropdownItem"

export function UndoMenuItem(props: DropdownItemProps) {
    const { undo } = useTemporalStore()
    return <DropdownItem {...props} action={() => {undo()}}></DropdownItem>
}