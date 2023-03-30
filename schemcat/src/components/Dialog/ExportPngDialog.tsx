import { useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { DiagramSvgIds, DiagramType, isDiagramTypeEnumValue } from '../../model/Constats'
import { toKebabCase } from '../../utils/String'
import { Checkbox } from '../UserControls/Checkbox'
import { Radio } from '../UserControls/Radio'
import { Dialog, DialogResult } from './Dialog'

interface ExportPngDialogData {
  includeSerialized: boolean
  selectedDiagram: DiagramType
}

/** Set the `xmlns` attribute of the whole element tree except the root recursively to xhtml.
 * @param e - The root element where to start
 */
function setXmlnsToXhtml(e: Element) {
  for (const child of e.children) {
    child.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    setXmlnsToXhtml(child)
  }
}
async function exportPng({ includeSerialized, selectedDiagram }: ExportPngDialogData) {
  const svg = document.getElementById(DiagramSvgIds[selectedDiagram])
  if (!svg) return
  svg.setAttribute('width', '1920')
  svg.setAttribute('height', '1080')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const foreignObjects = svg.getElementsByTagName('foreignObject')
  for (const foreignObject of foreignObjects) setXmlnsToXhtml(foreignObject)

  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  document.body.prepend(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const data = new XMLSerializer().serializeToString(svg)
  const DOMURL = window.URL || window.webkitURL || window
  const img = new Image(canvas.width, canvas.height)
  img.crossOrigin = 'anonymous'
  const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
  const url = DOMURL.createObjectURL(svgBlob)

  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    DOMURL.revokeObjectURL(url)
    const imgUri = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    // download
    const downloadLink = document.createElement('a')
    downloadLink.href = imgUri
    downloadLink.download = `${toKebabCase(useStore.getState().projectName)}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()

    // cleanup
    document.body.removeChild(downloadLink)
    document.body.removeChild(canvas)
    img.remove()
    svg.removeAttribute('width')
    svg.removeAttribute('height')
  }

  // trigger image load
  img.src = url
}

export interface ExportPngDialogProps {
  visible: boolean
  onClosing?: () => void
}

export function ExportPngDialog({ visible, onClosing }: ExportPngDialogProps) {
  const activeDiagram = useStore((state) => state.activeDiagram)

  const [data, setData] = useState<ExportPngDialogData>({
    includeSerialized: false,
    selectedDiagram: activeDiagram || DiagramType.Er,
  })
  function handleClosing(result: DialogResult) {
    if (result == DialogResult.Ok) exportPng(data)
    onClosing && onClosing()
  }

  function handleDiagramRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (isDiagramTypeEnumValue(value)) setData({ ...data, selectedDiagram: value })
    else throw new Error('invalid enum value: ' + value)
  }

  return (
    <Dialog visible={visible} title='Export PNG' onClosing={handleClosing}>
      <form>
        <Radio
          name='export-svg-diagram-choice'
          className='w-full border border-gray-400 p-1 mb-1 rounded'
          options={Object.values(DiagramType)}
          value={data.selectedDiagram}
          onChange={handleDiagramRadioChange}
        />
        <Checkbox
          label='Include serialized diagram'
          hoverHint='This makes the PNG file larger, but allows it to be opened and edited later in this application.'
          value={data.includeSerialized}
          onChange={() => setData({ ...data, includeSerialized: !data.includeSerialized })}
          disabled
        />
      </form>
    </Dialog>
  )
}
