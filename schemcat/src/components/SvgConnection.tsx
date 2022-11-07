interface SvgConnectionProps {
  points: { x: number; y: number }[]
}

function SvgConnection(props: SvgConnectionProps) {
  return (
    <polyline
      points={props.points.map((point) => `${point.x},${point.y}`).join(' ')}
      fill='none'
      stroke='black'
    />
  )
}

export default SvgConnection
