import { State } from "@hookstate/core"
import React, { useState } from "react"

interface MovableSvgComponentProps {
    x: State<number>,
    y: State<number>,
    children: React.ReactNode,
    svgRef: React.RefObject<SVGSVGElement>
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
    function handleMouseDown(event: React.MouseEvent) {
        const res = pageToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
        setState({ isDragging: true, offset: { x: res.x - props.x.get(), y: res.y - props.y.get() } })
    }
    function handleMouseMove(event: React.MouseEvent) {
        if(state.isDragging) {
            const res = pageToSvgCoordinates(event.pageX, event.pageY, props.svgRef.current)
            props.x.set(res.x - state.offset.x)
            props.y.set(res.y - state.offset.y)
        }
    }
    function handleMouseUp(event: React.MouseEvent) {
        setState({ isDragging: false, offset: { x: 0, y: 0 } })
    }
    function handleMouseLeave(event: React.MouseEvent) {
        if(state.isDragging) {
            handleMouseMove(event)   
            console.log("mouse left")
        }
    }
    return (
        <g transform={`translate(${props.x.get()}, ${props.y.get()})`} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {props.children}
        </g>
    )
}

MovableSvgComponent.defaultProps = {
    x: 0,
    y: 0
}

export default MovableSvgComponent