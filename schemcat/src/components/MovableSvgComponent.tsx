import React, { useState } from "react"
import { useTemporalStore } from "../hooks/useStore"

interface MovableSvgComponentProps {
    x: number,
    y: number,
    children: React.ReactNode,
    svgRef: React.RefObject<SVGSVGElement>
    onDrag?: (x: number, y: number) => void
    onClick?: () => void
}

function pageToSvgCoordinates(x: number, y: number, svg: SVGSVGElement | null): DOMPoint {
    if(svg === null) {
        console.error("SVG is null")
        return new SVGPoint(0, 0)
    }
    const pt = svg.createSVGPoint()
    pt.x = x
    pt.y = y
    return pt.matrixTransform(svg.getScreenCTM()?.inverse())
}

function MovableSvgComponent(props: MovableSvgComponentProps) {
    const [state, setState] = useState({ isDragging: false, offset: { x: 0, y: 0} })
    const { pause, resume } = useTemporalStore()
    function handleMouseDown(event: React.MouseEvent) {
        const res = pageToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
        setState({ isDragging: true, offset: { x: res.x - props.x, y: res.y - props.y } })
        pause()
    }
    function handleMouseMove(event: React.MouseEvent) {
        if(state.isDragging) {
            const res = pageToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
            if(props.onDrag){
                props.onDrag(res.x - state.offset.x, res.y - state.offset.y)
            }
        }
    }
    function handleMouseUp(event: React.MouseEvent) {
        setState({ isDragging: false, offset: { x: 0, y: 0 } })
        resume()
        console.log("Resumed")
        const res = pageToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
        if(props.onDrag){
            props.onDrag(res.x - state.offset.x, res.y - state.offset.y)
        }
    }
    function handleMouseLeave(event: React.MouseEvent) {
        if(state.isDragging) {
            handleMouseMove(event)
            console.log("mouse left")
        }
    }
    function handleClick(event: React.MouseEvent) {
        if(props.onClick) props.onClick()
    }
    return (
        <g transform={`translate(${props.x}, ${props.y})`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="cursor-pointer">
            {props.children}
        </g>
    )
}

MovableSvgComponent.defaultProps = {
    x: 0,
    y: 0
}

export default MovableSvgComponent