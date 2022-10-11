import {Connection, DiagramModel, DiagramNode, ErNode, ErNodeType, Model} from "../model/DiagramNode"
import create from "zustand"
import { devtools } from "zustand/middleware"
import produce from "immer"

function exampleDiagram() {
    const diagram = new DiagramModel()
    diagram.nodes = [
        new ErNode("Person", ErNodeType.Entity, 20, 1), //0
        new ErNode("name", ErNodeType.Attribute, 20, 100), //1
        new ErNode("age", ErNodeType.Attribute, 100, 100), //2
        new ErNode("Team", ErNodeType.Entity, 20, 200), //3
        new ErNode("name", ErNodeType.Attribute, 20, 300), //4
        new ErNode("member", ErNodeType.Relationship, 200, 150), //5
    ]
    diagram.links = [
        new Connection(diagram.nodes[0], diagram.nodes[1], "0..1"),
        new Connection(diagram.nodes[0], diagram.nodes[2], "0..1"),
        new Connection(diagram.nodes[3], diagram.nodes[4], "0..1"),
        new Connection(diagram.nodes[0], diagram.nodes[5], "0..*"),
        new Connection(diagram.nodes[3], diagram.nodes[5], "0..*"),
    ]
    return diagram
}
export const useStore = create<Model>()(
    devtools(
        (set) => ({
            diagram: exampleDiagram(),
            setDiagram: (diagram: DiagramModel) => {
                set({diagram})
            },
            updateNode: (node: ErNode) => {
                set(produce(
                    state => {
                        const index = state.diagram.nodes.findIndex((n: DiagramNode) => n.id === node.id)
                        if(index === -1) {
                            console.log("node id not found")
                            return
                        }
                        state.diagram.nodes[index] = node
                    }))
            },
            updateNodeById: (id: number, update: (node: DiagramNode) => void) => {
                set(produce(
                    state => {
                        const index = state.diagram.nodes.findIndex((n: DiagramNode) => n.id === id)
                        if(index === -1) {
                            console.error(`node ${id} not found`)
                            return
                        }
                        update(state.diagram.nodes[index])
                    }))
            },
            refreshLinksFromToNode: (node: ErNode) => {
                set(state => {
                    return {
                        diagram: {
                            ...state.diagram,
                            links: state.diagram.links.map(l => {
                                if (l.from.id === node.id) return {...l, from: node}
                                else if (l.to.id === node.id) return {...l, to: node}
                                else return l
                            })
                        }}})
            },
        })
    )
)