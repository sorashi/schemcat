export interface PositionedSvgGroupProps {
  x: number
  y: number
  children: React.ReactNode
}
export function PositionedSvgGroup({ x, y, children }: PositionedSvgGroupProps) {
  return <g transform={`translate(${x}, ${y})`}>{children}</g>
}
