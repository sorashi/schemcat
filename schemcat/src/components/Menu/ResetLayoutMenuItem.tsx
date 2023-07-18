import { LAYOUT_STORAGE } from '../../Constants'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

/** A dropdown menu item that resets the UI layout.
 * It can be used in case the layout gets into a corrupted state (for example a pane disappears).
 */
export function ResetLayoutMenuItem(props: DropdownItemProps) {
  return (
    <DropdownItem
      {...props}
      action={() => {
        localStorage.removeItem(LAYOUT_STORAGE)
        location.reload()
      }}></DropdownItem>
  )
}
