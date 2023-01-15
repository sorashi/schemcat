/** Transforms client coordinates (perhaps from a `MouseEvent`) to SVG coordinates (the SVG may be scaled, translated, rotated...).
 * Difference between page and client coordinates: https://stackoverflow.com/a/21452887/1697953
 */
export function clientToSvgCoordinates(x: number, y: number, svg: SVGSVGElement | null): DOMPoint {
  if (svg === null) {
    console.error('SVG is null')
    return new SVGPoint(0, 0)
  }
  const pt = svg.createSVGPoint()
  pt.x = x
  pt.y = y
  return pt.matrixTransform(svg.getScreenCTM()?.inverse())
}
