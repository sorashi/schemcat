import React, { useState } from 'react'
import { Point } from '../model/Point'

interface DraggableProps {
  onDragging?: (start: Point, now: Point) => void
  /** @returns `true` if you want to prevent the dragging */
  onDragStart?: (start: Point, target: EventTarget) => boolean
  onDragEnd?: (start: Point, end: Point) => void
  children: React.ReactNode
}

export function Draggable(props: DraggableProps) {
  const [state, setState] = useState({
    isDragging: false,
    start: { x: 0, y: 0 },
  })
  function handleMouseDown(e: React.MouseEvent) {
    let prevent = false
    if (e.button !== 0) return
    if (props.onDragStart) prevent = props.onDragStart({ x: e.clientX, y: e.clientY }, e.target)
    setState({
      ...state,
      isDragging: !prevent,
      start: { x: e.clientX, y: e.clientY },
    })
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (state.isDragging) {
      if (props.onDragEnd) props.onDragEnd(state.start, { x: e.clientX, y: e.clientY })
    }
    setState({ ...state, isDragging: false })
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (state.isDragging) {
      if (props.onDragging) props.onDragging(state.start, { x: e.clientX, y: e.clientY })
    }
  }
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className='w-full h-full overflow-hidden'>
      {props.children}
    </div>
  )
}
