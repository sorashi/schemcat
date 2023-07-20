import React, { useState } from 'react'
import { useTemporalStore } from '../hooks/useStore'
import { clientToSvgCoordinates } from '../utils/Svg'

interface MovableSvgComponentProps {
  x: number
  y: number
  children: React.ReactNode
  svgRef: React.RefObject<SVGSVGElement>
  onDrag?: (x: number, y: number) => void
  onClick?: (event: React.MouseEvent) => void
  onContextMenu?: (event: React.MouseEvent) => void
}

function MovableSvgComponent(props: MovableSvgComponentProps) {
  const [state, setState] = useState({
    isDragging: false,
    offset: { x: 0, y: 0 },
  })
  const { pause, resume } = useTemporalStore()
  function handleMouseDown(event: React.MouseEvent) {
    if (event.button !== 0) return
    const res = clientToSvgCoordinates(event.clientX, event.clientY, props.svgRef.current)
    setState({
      isDragging: true,
      offset: { x: res.x - props.x, y: res.y - props.y },
    })
    pause()
  }
  function handleMouseMove(event: React.MouseEvent) {
    if (state.isDragging) {
      const res = clientToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
      if (props.onDrag) {
        props.onDrag(res.x - state.offset.x, res.y - state.offset.y)
      }
    }
  }
  function handleMouseUp(event: React.MouseEvent) {
    if (event.button !== 0) return
    setState({ isDragging: false, offset: { x: 0, y: 0 } })
    resume()
    const res = clientToSvgCoordinates(event.clientX, event.clientY, props.svgRef.current)
    if (props.onDrag) {
      props.onDrag(res.x - state.offset.x, res.y - state.offset.y)
    }
  }
  function handleMouseLeave(event: React.MouseEvent) {
    if (state.isDragging) {
      handleMouseMove(event)
    }
  }
  function handleClick(event: React.MouseEvent) {
    if (props.onClick) props.onClick(event)
  }
  function handleContextMenu(this: unknown, event: React.MouseEvent) {
    if (props.onContextMenu) props.onContextMenu.bind(this)(event)
  }
  return (
    <g
      transform={`translate(${props.x}, ${props.y})`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className='cursor-pointer'>
      {props.children}
    </g>
  )
}

MovableSvgComponent.defaultProps = {
  x: 0,
  y: 0,
}

export default MovableSvgComponent
