import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { DiagramModel } from '../../model'
import { Dialog, DialogResult } from '../Dialog/Dialog'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

function setStateToEmptyDiagram() {
  useStore.setState((state) => ({ ...state, diagram: new DiagramModel() }))
}

export function NewMenuItem(props: DropdownItemProps) {
  const [dialogVisible, setDialogVisible] = useState(false)

  function action() {
    setDialogVisible(true)
  }
  function handleDialogClosing(result: DialogResult) {
    if (result === DialogResult.Ok) {
      setStateToEmptyDiagram()
    }
    setDialogVisible(false)
  }

  return (
    <>
      <Dialog visible={dialogVisible} onClosing={handleDialogClosing}>
        Are you sure you want to create a new diagram?
        <br />
        <b>You will lose all unexported/unsaved changes.</b>
      </Dialog>
      <DropdownItem {...props} action={action} />
    </>
  )
}
