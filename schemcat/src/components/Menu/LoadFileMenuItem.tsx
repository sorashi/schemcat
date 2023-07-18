import { DropdownItem, DropdownItemProps } from './DropdownItem'
import { useStore, StoreModel } from '../../hooks/useStore'
import { DiagramModel } from '../../model'
import { plainToInstance } from 'class-transformer'
import extract from 'png-chunks-extract'
import text from 'png-chunk-text'
import { Buffer } from 'buffer'
import { MIME } from '../../Constants'
import { DeepPartial } from '../../utils/Types'

function loadFromPng(event: ProgressEvent<FileReader>) {
  if (typeof event.target?.result === 'string' || !event.target?.result) throw new Error('Invalid file')

  const buffer = Buffer.from(event.target.result)
  const chunks = extract(buffer)
  const chunk = chunks
    .filter(function (chnk: any) {
      return chnk.name == 'tEXt'
    })
    .map(function (chunk: any) {
      return text.decode(chunk.data)
    })
    .find((chunk: any) => chunk.keyword == 'schemcat')
  if (!chunk) {
    alert('Invalid PNG file (perhaps does not contain serialized data?)')
    throw new Error('Invalid file')
  }
  const json = atob(chunk.text)
  const plainObject = JSON.parse(json)
  const erDiagram = plainToInstance(DiagramModel, plainObject)
  useStore.setState((state) => ({ ...state, diagram: erDiagram }), true)
}

function loadFromSvg(event: ProgressEvent<FileReader>) {
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
  const erDiagram = plainToInstance(DiagramModel, plainObject)
  useStore.setState((state) => ({ ...state, diagram: erDiagram }), true)
  // cleanup
  document.body.removeChild(div)
}

function loadFromJson(event: ProgressEvent<FileReader>) {
  if (typeof event.target?.result !== 'string') throw new Error('Invalid file')
  try {
    const plain = JSON.parse(event.target.result)
    const diagram = plainToInstance(DiagramModel, plain.diagram)
    const projectName = plain.projectName
    useStore.setState((state) => ({ ...state, diagram: diagram, projectName: projectName }), true)
  } catch (err) {
    alert(`Error while parsing the file: ${err}`)
  }
}

function loadFromFile(file: File) {
  const reader = new FileReader()
  reader.onload = (event) => {
    switch (file.type) {
      case MIME.json:
        loadFromJson(event)
        break
      case MIME.svg:
        loadFromSvg(event)
        break
      case MIME.png:
        loadFromPng(event)
        break
    }
  }

  if (file.type == MIME.svg || file.type == MIME.json) reader.readAsText(file)
  else if (file.type == MIME.png) reader.readAsArrayBuffer(file)
  else alert('Unsupported file type: ' + file.type)
}

function openFileDialogThenLoadFromFile() {
  const ofd = document.createElement('input')
  ofd.type = 'file'
  ofd.style.display = 'none'
  ofd.multiple = false
  ofd.accept = [MIME.svg, MIME.json, MIME.png].join(',')
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
