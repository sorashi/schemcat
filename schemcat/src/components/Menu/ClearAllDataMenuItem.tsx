import { useState } from 'react'
import { DropdownItem, DropdownItemProps } from './DropdownItem'
import { Dialog, DialogResult } from '../Dialog/Dialog'

/**
 * This menu item clears local storage and reloads the page.
 * This means the default example diagram will be shown and the FlexLayout state will be reset to the default.
 * This can be used as a last resort if something breaks.
 * A confirmation dialog is shown before this action to inform the user about losing all work.
 */
export function ClearAllDataMenuItem(props: DropdownItemProps) {
  const [dialogVisible, setDialogVisible] = useState(false)
  function action() {
    setDialogVisible(true)
  }
  function handleDialogClosing(result: DialogResult) {
    if (result === DialogResult.Ok) {
      localStorage.clear()
      location.reload()
    }
    setDialogVisible(false)
  }
  return (
    <>
      <Dialog visible={dialogVisible} onClosing={handleDialogClosing}>
        Are you sure you want to clear all data?
        <br />
        <b>By clearing all data you will lose any unexported work. Your layout will also be reset.</b>
      </Dialog>
      <DropdownItem {...props} action={action}></DropdownItem>
    </>
  )
}
