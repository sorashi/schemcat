import {Connection, DiagramModel, DiagramNode, ErNode, ErNodeType} from "../model/DiagramModel"
import create from "zustand"
import { devtools, persist } from "zustand/middleware"
import { temporal } from "zundo"

import produce from "immer"
import Diagram from "../components/Diagram"

function exampleDiagram() {
    const diagram = new DiagramModel()
    diagram.nodes = [
        new ErNode("Person", ErNodeType.EntityType, 20, 1), //0
        new ErNode("name", ErNodeType.AttributeType, 20, 100), //1
        new ErNode("age", ErNodeType.AttributeType, 100, 100), //2
        new ErNode("Team", ErNodeType.EntityType, 20, 200), //3
        new ErNode("name", ErNodeType.AttributeType, 20, 300), //4
        new ErNode("member", ErNodeType.RelationshipType, 200, 150), //5
    ]
    diagram.links = [
        new Connection(diagram.nodes[0].id, diagram.nodes[1].id, "0..1"),
        new Connection(diagram.nodes[0].id, diagram.nodes[2].id, "0..1"),
        new Connection(diagram.nodes[3].id, diagram.nodes[4].id, "0..1"),
        new Connection(diagram.nodes[0].id, diagram.nodes[5].id, "0..*"),
        new Connection(diagram.nodes[3].id, diagram.nodes[5].id, "0..*"),
    ]
    return diagram
}
export interface StoreModel {
    diagram: DiagramModel
    updateDiagram: (update: (diagram: DiagramModel) => void) => void
    updateNode: (node: ErNode) => void
    updateNodeById: (id: number, update: (node: DiagramNode) => void) => void
}
export const useStore = create<StoreModel>()(
    devtools(
        persist(
            temporal(
                (set) => ({
                    diagram: exampleDiagram(),
                    setDiagram: (diagram: DiagramModel) => {
                        set({diagram})
                    },
                    updateDiagram: (update: (diagram: DiagramModel) => void) => {
                        set(produce((state) => {
                            update(state.diagram)
                        }))
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
                }), {
                    //limit: 50,
                    partialize: (state: StoreModel) => {
                        const { diagram: { selectedNodeId, ...diagRest }, ...rest } = state
                        return { diagram: { ...diagRest }, ...rest }
                    },
                })
            , {
                name: "schemcat-state",
                getStorage: () => localStorage,
            })
    )
)
export const useTemporalStore = create(useStore.temporal)