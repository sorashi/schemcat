import { Connection, DiagramModel, DiagramNode, ErNode, ErNodeType, Cardinality } from '../model/DiagramModel'
import { create } from 'zustand'
import { devtools, persist, StorageValue } from 'zustand/middleware'
import { temporal } from 'zundo'
import { produce } from 'immer'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { DeepPartial } from '../utils/Types'

function exampleDiagram(): DiagramModel {
  const diagram = new DiagramModel()
  const person = new ErNode('Person', ErNodeType.EntityType, 20, 1, true)
  const givenName = new ErNode('givenName', ErNodeType.AttributeType, -90, 110, true)
  const surname = new ErNode('surname', ErNodeType.AttributeType, 10, 110, true)
  const nationalId = new ErNode('nationalId', ErNodeType.AttributeType, 65, -70, true)
  nationalId.width = 120
  const age = new ErNode('age', ErNodeType.AttributeType, 105, 110, true)
  const team = new ErNode('Team', ErNodeType.EntityType, 20, 200, true)
  const teamName = new ErNode('name', ErNodeType.AttributeType, 20, 300, true)
  const teamMember = new ErNode('member', ErNodeType.RelationshipType, 200, 150, true)
  diagram.nodes = [person, givenName, surname, age, nationalId, team, teamName, teamMember]
  diagram.links = [
    new Connection(person.id, givenName.id, new Cardinality(0, 1), true),
    new Connection(person.id, surname.id, new Cardinality(0, 1), true),
    new Connection(person.id, age.id, new Cardinality(0, 1), true),
    new Connection(person.id, nationalId.id, new Cardinality(1, 1), true),
    new Connection(team.id, teamName.id, new Cardinality(0, 1), true),
    new Connection(team.id, teamMember.id, new Cardinality(0, 1), true),
    new Connection(person.id, teamMember.id, new Cardinality(0, 1), true),
  ]
  person.identifiers.push([givenName.id, surname.id, age.id])
  // person.identifiers.push([givenName.id, surname.id])
  person.identifiers.push([nationalId.id])
  // Simulate persistence serialization and deserialization. This is because
  // we need the state to be pure js objects, not class instances. State
  // managers compare class instances using reference equality and may not
  // detect global state change in some cases. This is the invariant to
  // preserve throughout the whole application.
  return {
    ...instanceToPlain(diagram),
    selectedNodeIds: new Set<number>(),
  } as DiagramModel
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
                const index = state.diagram.nodes.findIndex((n: DiagramNode) => n.id === node.id)
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
                const index = state.diagram.nodes.findIndex((n: DiagramNode) => n.id === id)
                if (index === -1) {
                  console.log('node id not found')
                  return
                }
                state.diagram.nodes.splice(index, 1)
                state.diagram.links = state.diagram.links.filter((l: Connection) => l.fromId !== id && l.toId !== id)
              })
            )
          },
          updateNodeById: (id: number, update: (node: DiagramNode) => void) => {
            set(
              produce((state) => {
                const index = state.diagram.nodes.findIndex((n: DiagramNode) => n.id === id)
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
          partialize: partializeStoreModel,
        }
      ),
      {
        storage: {
          // deserialize
          getItem: (name: string) => {
            const plain: StorageValue<DeepPartial<StoreModel>> = JSON.parse(localStorage.getItem(name) || '{}')
            plain.state.diagram = plainToInstance(DiagramModel, plain.state.diagram)
            return plain
          },
          // serialize
          setItem: (name: string, value: StorageValue<DeepPartial<StoreModel>>) =>
            localStorage.setItem(name, JSON.stringify(value)),
          removeItem: (name: string) => localStorage.removeItem(name),
        },
        name: 'schemcat-state',
        partialize: partializeStoreModel,
      }
    )
  )
)

function partializeStoreModel(state: StoreModel): DeepPartial<StoreModel> {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // ignore a part of the state
  const {
    isZoomPanSynced,
    diagram: { selectedNodeIds, ...diagRest },
    ...rest
  } = state
  const partialized: DeepPartial<StoreModel> = { diagram: { ...diagRest }, ...rest }
  return partialized
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export const useTemporalStore = create(useStore.temporal)
