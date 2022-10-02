function SvgDiamondShape(props: any) {
    function getPolygonPoints(props: any) {
        const { x = 0, y = 0, width = 0, height = 0 } = props
        return `${x},${y + height / 2} ${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height}`
    }
    return (
        <polygon {...props} points={getPolygonPoints(props)}></polygon>
    )
}

export default SvgDiamondShape