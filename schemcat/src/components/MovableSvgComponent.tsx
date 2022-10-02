interface MovableSvgComponentProps {
    x: number,
    y: number,
    children: React.ReactNode,
}

function MovableSvgComponent(props: MovableSvgComponentProps) {
    function handleMouseDown(event: unknown) {
        console.log(event)
    }
    function handleMouseMove(event: unknown) {
        console.log(event)
    }
    function handleMouseUp(event: unknown) {
        console.log(event)
    }
    return (
        <g transform={`translate(${props.x}, ${props.y})`} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            {props.children}
        </g>
    )
}

MovableSvgComponent.defaultProps = {
    x: 0,
    y: 0
}

export default MovableSvgComponent