export const twoSidedMarkerId = 'marker-two-sided'

function TwoSidedMarker() {
  return (
    <marker
      id={twoSidedMarkerId}
      viewBox='0 0 10 10'
      refX='10'
      refY='5'
      markerUnits='strokeWidth'
      markerWidth='10'
      markerHeight='10'
      strokeWidth='1'
      orient='auto'>
      <path d='M 0 0 L 10 5 L 0 10' fill='none' stroke='black' strokeWidth={1} />
    </marker>
  )
}

export default TwoSidedMarker
