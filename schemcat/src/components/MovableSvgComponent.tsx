function MovableSvgComponent(props: any) {
    function handleMouseDown(event: any) {
        console.log(event)
    }
    function handleMouseMove(event: any) {
        console.log(event)
    }
    function handleMouseUp(event: any) { }
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