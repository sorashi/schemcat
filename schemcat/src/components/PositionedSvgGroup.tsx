export interface PositionedSvgGroupProps {
  x: number
  y: number
  children: React.ReactNode
  onClick?: React.MouseEventHandler<SVGGElement>
}
export function PositionedSvgGroup({ x, y, children, onClick }: PositionedSvgGroupProps) {
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick}>
      {children}
    </g>
  )
}
