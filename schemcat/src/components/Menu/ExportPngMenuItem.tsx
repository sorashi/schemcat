import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { ExportPngDialog } from '../Dialog/ExportPngDialog'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

export function ExportPngMenuItem(props: DropdownItemProps) {
  const [visible, setVisible] = useState(false)
  const deselect = useStore((state) => state.deselect)
  return (
    <>
      <DropdownItem
        {...props}
        action={() => {
          deselect()
          setVisible(true)
        }}></DropdownItem>
      <ExportPngDialog visible={visible} onClosing={() => setVisible(false)}></ExportPngDialog>
    </>
  )
}
