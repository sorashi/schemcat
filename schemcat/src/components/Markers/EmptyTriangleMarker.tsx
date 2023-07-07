export const emptyTriangleMarkerId = 'marker-triangle-empty'

export function EmptyTriangleMarker() {
  return (
    <marker
      id={emptyTriangleMarkerId}
      viewBox='0 0 10 10'
      refX='9'
      refY='5'
      markerUnits='strokeWidth'
      markerWidth='15'
      markerHeight='15'
      strokeWidth='1'
      strokeLinejoin='round'
      orient='auto'>
      <path d='M 1 1 L 9 5 L 1 9 z' fill='white' stroke='black' />
    </marker>
  )
}
