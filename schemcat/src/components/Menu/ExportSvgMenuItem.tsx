import { instanceToPlain } from 'class-transformer'
import { useStore } from '../../hooks/useStore'
import { toKebabCase } from '../../utils/String'
import { assertNever } from '../../utils/Types'
import { ExportSvgDialog, ExportSvgDialogData, useExportSvgDialogState } from '../Dialog/ExportSvgDialog'
import { DiagramSvgIds } from '../../model/Constats'
import { DropdownItem, DropdownItemProps } from './DropdownItem'
import { download, downloadBlob } from '../../utils/Download'

function useExportSvgDialog(onSubmit: (data: ExportSvgDialogData) => void) {
  const setIsVisible = useExportSvgDialogState((state) => state.setIsVisible)
  const setOnOk = useExportSvgDialogState((state) => state.setOnOk)
  return () => {
    setOnOk(onSubmit)
    setIsVisible(true)
  }
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
function exportSvg({ includeSerialized, selectedDiagram }: ExportSvgDialogData) {
  const svg = document.getElementById(DiagramSvgIds[selectedDiagram])
  if (!svg) return
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const foreignObjects = svg.getElementsByTagName('foreignObject')
  for (const foreignObject of foreignObjects) setXmlnsToXhtml(foreignObject)

  if (includeSerialized) {
    const erDiagram = useStore.getState().diagram
    svg.setAttribute('content', btoa(JSON.stringify(instanceToPlain(erDiagram))))
  } else {
    svg.removeAttribute('content')
  }

  const svgData = svg.outerHTML
  const preface = '<?xml version="1.0" standalone="no"?>\n'
  const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' })
  const filename = `${toKebabCase(useStore.getState().projectName)}.svg`

  downloadBlob(svgBlob, filename)
}

export function ExportSvgMenuItem(props: DropdownItemProps) {
  const makeVisible = useExportSvgDialog((data) => exportSvg(data))
  const deselect = useStore((state) => state.deselect)
  return (
    <>
      <DropdownItem
        {...props}
        action={() => {
          deselect()
          makeVisible()
        }}
      />
      <ExportSvgDialog />
    </>
  )
}
