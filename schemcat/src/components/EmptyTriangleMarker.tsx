export const emptyTriangleMarkerId = 'marker-triangle-empty'

function EmptyTriangleMarker() {
  return (
    <marker
      id={emptyTriangleMarkerId}
      viewBox='0 0 10 10'
      refX='10'
      refY='5'
      markerUnits='strokeWidth'
      markerWidth='15'
      markerHeight='15'
      strokeWidth={1}
      orient='auto'>
      <path d='M 0 0 L 10 5 L 0 10 z' fill='white' stroke='black' />
    </marker>
  )
}

export default EmptyTriangleMarker
