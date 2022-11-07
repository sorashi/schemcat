import { useTemporalStore } from '../../hooks/useStore'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

export function RedoMenuItem(props: DropdownItemProps) {
  const { redo } = useTemporalStore()
  return (
    <DropdownItem
      {...props}
      action={() => {
        redo()
      }}></DropdownItem>
  )
}
