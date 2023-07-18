import { instanceToPlain } from 'class-transformer'
import { StoreModel, useStore } from '../../hooks/useStore'
import { DropdownItem, DropdownItemProps } from './DropdownItem'
import { toKebabCase } from '../../utils/String'
import { downloadBlob } from '../../utils/Download'
import { DiagramModel } from '../../model/DiagramModel'
import { DeepPartial } from '../../utils/Types'

export function ExportJsonMenuItem(props: DropdownItemProps) {
  function action() {
    const object: DeepPartial<StoreModel> = {}
    const state = useStore.getState()
    // add serialized properties
    object.projectName = state.projectName
    object.diagram = instanceToPlain<DiagramModel>(state.diagram)
    // remove unnecessary properties
    object.diagram.selectedEntities = undefined

    // download
    const blob = new Blob([JSON.stringify(object)], { type: 'application/json' })
    const filename = `${toKebabCase(object.projectName)}.json`
    downloadBlob(blob, filename)
  }
  return <DropdownItem {...props} action={action}></DropdownItem>
}
