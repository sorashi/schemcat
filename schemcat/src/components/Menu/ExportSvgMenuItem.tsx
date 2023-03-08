import { DropdownItem, DropdownItemProps } from './DropdownItem'

/** Set the `xmlns` attribute of the whole element tree except the root recursively to xhtml.
 * @param e - The root element where to start
 */
function setXmlnsToXhtml(e: Element) {
  for (const child of e.children) {
    child.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
    setXmlnsToXhtml(child)
  }
}

function exportSvg() {
  const svg = document.getElementById('erDiagram')
  if (!svg) return
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const foreignObjects = svg.getElementsByTagName('foreignObject')
  for (const foreignObject of foreignObjects) setXmlnsToXhtml(foreignObject)

  const svgData = svg.outerHTML
  const preface = '<?xml version="1.0" standalone="no"?>\n'
  const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)
  const downloadLink = document.createElement('a')
  downloadLink.href = svgUrl
  downloadLink.download = 'erdiagram.svg'
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

export function ExportSvgMenuItem(props: DropdownItemProps) {
  return <DropdownItem {...props} action={exportSvg} />
}
