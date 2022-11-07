import {
  Connection,
  DiagramModel,
  DiagramNode,
  ErNode,
  ErNodeType,
} from '../model/DiagramModel'
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { temporal } from 'zundo'
import { produce } from 'immer'

function exampleDiagram() {
  const diagram = new DiagramModel()
  diagram.nodes = [
    new ErNode('Person', ErNodeType.EntityType, 20, 1, true), //0
    new ErNode('name', ErNodeType.AttributeType, 20, 100, true), //1
    new ErNode('age', ErNodeType.AttributeType, 100, 100, true), //2
    new ErNode('Team', ErNodeType.EntityType, 20, 200, true), //3
    new ErNode('name', ErNodeType.AttributeType, 20, 300, true), //4
    new ErNode('member', ErNodeType.RelationshipType, 200, 150, true), //5
  ]
  diagram.links = [
    new Connection(diagram.nodes[0].id, diagram.nodes[1].id, '0..1', true),
    new Connection(diagram.nodes[0].id, diagram.nodes[2].id, '0..1', true),
    new Connection(diagram.nodes[3].id, diagram.nodes[4].id, '0..1', true),
    new Connection(diagram.nodes[0].id, diagram.nodes[5].id, '0..*', true),
    new Connection(diagram.nodes[3].id, diagram.nodes[5].id, '0..*', true),
  ]
  // Simulate persistence serialization and deserialization. This is because
  // we need the state to be pure js objects, not class instances. State
  // managers compare class instances using reference equality and may not
  // detect global state change in some cases. This is the invariant to
  // preserve throughout the whole application.
  return {
    ...JSON.parse(JSON.stringify(diagram)),
    selectedNodeIds: new Set<number>(),
  }
}
export interface StoreModel {
  diagram: DiagramModel
  isZoomPanSynced: boolean
  setIsZoomPanSynced: (isLocked: boolean) => void
  updateDiagram: (update: (diagram: DiagramModel) => void) => void
  updateNode: (node: ErNode) => void
  /** removes the node and its connections from the diagram */
  removeNodeById: (id: number) => void
  /** calls and update function on the node */
  updateNodeById: (id: number, update: (node: DiagramNode) => void) => void
}
export const useStore = create<StoreModel>()(
  devtools(
    persist(
      temporal(
        (set) => ({
          diagram: exampleDiagram(),
          isZoomPanSynced: false,
          setIsZoomPanSynced: (isZoomPanSynced: boolean) =>
            set(
              produce((state) => {
                state.isZoomPanSynced = isZoomPanSynced
              })
            ),
          setDiagram: (diagram: DiagramModel) => {
            set({ diagram })
          },
          updateDiagram: (update: (diagram: DiagramModel) => void) => {
            set(
              produce((state) => {
                update(state.diagram)
              })
            )
          },
          updateNode: (node: ErNode) => {
            set(
              produce((state) => {
                const index = state.diagram.nodes.findIndex(
                  (n: DiagramNode) => n.id === node.id
                )
                if (index === -1) {
                  console.log('node id not found')
                  return
                }
                state.diagram.nodes[index] = node
              })
            )
          },
          removeNodeById: (id: number) => {
            set(
              produce((state) => {
                const index = state.diagram.nodes.findIndex(
                  (n: DiagramNode) => n.id === id
                )
                if (index === -1) {
                  console.log('node id not found')
                  return
                }
                state.diagram.nodes.splice(index, 1)
                state.diagram.links = state.diagram.links.filter(
                  (l: Connection) => l.fromId !== id && l.toId !== id
                )
              })
            )
          },
          updateNodeById: (id: number, update: (node: DiagramNode) => void) => {
            set(
              produce((state) => {
                const index = state.diagram.nodes.findIndex(
                  (n: DiagramNode) => n.id === id
                )
                if (index === -1) {
                  console.error(`node ${id} not found`)
                  return
                }
                update(state.diagram.nodes[index])
              })
            )
          },
        }),
        {
          //limit: 50,
          partialize: (state: StoreModel) => {
            // ignore a part of the state
            const {
              isZoomPanSynced,
              diagram: { selectedNodeIds, ...diagRest },
              ...rest
            } = state
            return { diagram: { ...diagRest }, ...rest }
          },
        }
      ),
      {
        name: 'schemcat-state',
        getStorage: () => localStorage,
        partialize: (state: StoreModel) => {
          // ignore a part of the state
          const {
            isZoomPanSynced,
            diagram: { selectedNodeIds, ...diagRest },
            ...rest
          } = state
          return { diagram: { ...diagRest }, ...rest }
        },
        serialize: (state) => {
          return JSON.stringify(state)
        },
        deserialize: (s) => {
          const o = JSON.parse(s)
          o.state.diagram.selectedNodeIds = new Set<number>()
          return o
        },
      }
    )
  )
)
export const useTemporalStore = create(useStore.temporal)
