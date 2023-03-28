import { useState } from 'react'
import { ExportPngDialog } from '../Dialog/ExportPngDialog'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

export function ExportPngMenuItem(props: DropdownItemProps) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <DropdownItem {...props} action={() => setVisible(true)}></DropdownItem>
      <ExportPngDialog visible={visible} onClosing={() => setVisible(false)}></ExportPngDialog>
    </>
  )
}
