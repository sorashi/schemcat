import * as d3 from "d3"
import $ from "jquery"

class ErNode {
    text:string
    x:number
    y:number
    
    constructor(text:string, x:number, y:number) {
        this.text = text
        this.x = x
        this.y = y
    }
}
const data = [new ErNode("Person", 30, 50), new ErNode("Bank Account", 120, 150), new ErNode("Pet", 60, 230)]

function updatePath(path: d3.Selection<SVGPathElement, unknown, HTMLElement, unknown>) {
    path.attr("d", `M${data[0].x} ${data[0].y} L${data[1].x} ${data[1].y}`)
}

function svgVersion() {
    const svg = d3.select("#er-diagram").append("svg")
        .attr("height", 400)
        .attr("width", 400)
    
    const path = svg.append("path").attr("stroke", "black")
    updatePath(path)
    const selection = svg.selectAll("g").data(data).enter()
    const group = selection.append("g")
    const drag = d3.drag()
        .on("drag", function(event, d: ErNode) {
            d.x = event.x
            d.y = event.y
            d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`)
            updatePath(path)
        })
    group.attr("transform", d => `translate(${d.x}, ${d.y})`)
        .call(drag)
    group.append("ellipse")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("ry", 30)
        .attr("rx", d => d.text.length * 7)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("style", "overflow: visible")
    group.append("foreignObject")
        .attr("width", d => d.text.length * 7 * 2)
        .attr("height", 30 * 2)
        .attr("x", d => -d.text.length * 4)
        .attr("y", -10)
        .append("xhtml:div")
        .append("xhtml:span")
        .append("xhtml:u")
        .text(d=>d.text)
}

function expandMenu(event) {
    $(this).children(".submenu").css("display", "block")
    console.log(this)
}
function contractMenu(event) {
    $(this).children(".submenu").css("display", "none")
}
function closeView(event) {
    $(this).parents(".viewbox").css("display", "none")
}
function init() {
    // htmlVersion()
    svgVersion()
    $(".menu-item, .submenu-item").hover(expandMenu, contractMenu)
    $(".view-close-btn").click(closeView)
}
$(document).ready(function() {
    init()
})

