import { DropdownItem, DropdownItemProps } from './DropdownItem'
import { useStore, StoreModel } from '../../hooks/useStore'
import { DiagramModel } from '../../model'
import { plainToInstance } from 'class-transformer'

function loadFromFile(file: File) {
  if (file.type != 'image/svg+xml') {
    alert('Unsupported file type: ' + file.type)
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    if (typeof event.target?.result !== 'string') throw new Error('Invalid file')
    const div = document.createElement('div')
    document.body.appendChild(div)
    div.insertAdjacentHTML('afterbegin', event.target.result)
    const elements = div.getElementsByTagName('svg')
    if (elements.length != 1) throw new Error('Invalid file')
    const svg = elements[0]
    const content = svg.getAttribute('content')

    if (!content) {
      alert('Invalid file (perhaps does not contain serialized diagram).')
      throw new Error('Invalid file')
    }

    const json = atob(content)
    const plainObject = JSON.parse(json)
    console.log(plainObject)
    const erDiagram = plainToInstance(DiagramModel, plainObject)
    useStore.setState((state) => ({ ...state, diagram: erDiagram }), true)
    // cleanup
    document.body.removeChild(div)
  }
  reader.readAsText(file)
}

function openFileDialogThenLoadFromFile() {
  const ofd = document.createElement('input')
  ofd.type = 'file'
  ofd.style.display = 'none'
  ofd.multiple = false
  ofd.accept = 'image/svg+xml,application/json'
  ofd.onchange = (_) => {
    if (!ofd.files) return
    const files = Array.from(ofd.files)
    if (files.length != 1) throw new Error('Too many files')
    const file = files[0]
    loadFromFile(file)
  }
  document.body.appendChild(ofd)
  ofd.click()
  document.body.removeChild(ofd)
}

export function LoadFileMenuItem(props: DropdownItemProps) {
  return <DropdownItem {...props} action={() => openFileDialogThenLoadFromFile()} />
}
