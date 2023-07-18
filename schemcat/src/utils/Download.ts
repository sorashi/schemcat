/**
 * Forces the browser to start a user download of a resource.
 * @param url Location of the resource
 * @param filename How to name the file (including extension)
 */
export function download(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
