import { toRadians } from "../utils/Utils"

function getPolygonPoints(props: any) {
    const { x = 0, y = 0, width = 0, height = 0 } = props
    // return `${x},${y + height / 2} ${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height}`
    // temporary "bounding diamond"
    const angle = toRadians(25)
    const a = height / 2
    const b = width / 2
    const cPrime = a/Math.tan(angle)
    const dPrime = b*Math.tan(angle)
    const pointA = `${x-cPrime},${a}`
    const pointB = `${b},${y-dPrime}`
    const pointC = `${x+width+cPrime},${a}`
    const pointD = `${b},${y+height+dPrime}`
    return `${pointA} ${pointB} ${pointC} ${pointD}`
}
function SvgDiamondShape(props: any) {
    return (
        <polygon {...props} points={getPolygonPoints(props)}></polygon>
    )
}

export default SvgDiamondShape