import { useStore } from '../../hooks/useStore'
import { DiagramModel } from '../../model'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

function setStateToEmptyDiagram() {
  useStore.setState((state) => ({ ...state, diagram: new DiagramModel() }))
}

export function NewMenuItem(props: DropdownItemProps) {
  return <DropdownItem {...props} action={setStateToEmptyDiagram} />
}
