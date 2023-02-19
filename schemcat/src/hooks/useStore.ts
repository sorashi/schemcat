import {
  Connection,
  DiagramModel,
  DiagramNode,
  ErNode,
  ErNodeType,
  Cardinality,
  ErIdentifier,
  ErDiagramEntityType,
  ErIsaHierarchy,
} from '../model/DiagramModel'
import { create } from 'zustand'
import { devtools, persist, StorageValue } from 'zustand/middleware'
import { temporal } from 'zundo'
import { produce, enableMapSet } from 'immer'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { DeepPartial } from '../utils/Types'

function exampleDiagram(): DiagramModel {
  const diagram = new DiagramModel()
  const person = new ErNode('Person', ErNodeType.EntityType, 20, 1, true)
  const student = new ErNode('Student', ErNodeType.EntityType, 250, -55, true)
  const teacher = new ErNode('Teacher', ErNodeType.EntityType, 250, 55, true)
  const givenName = new ErNode('givenName', ErNodeType.AttributeType, -90, 110, true)
  const surname = new ErNode('surname', ErNodeType.AttributeType, 10, 110, true)
  const nationalId = new ErNode('nationalId', ErNodeType.AttributeType, 65, -70, true)
  nationalId.width = 120
  const age = new ErNode('age', ErNodeType.AttributeType, 105, 110, true)
  const team = new ErNode('Team', ErNodeType.EntityType, 20, 200, true)
  const teamName = new ErNode('name', ErNodeType.AttributeType, 20, 300, true)
  const teamMember = new ErNode('member', ErNodeType.RelationshipType, 200, 150, true)
  diagram.nodes = [person, student, teacher, givenName, surname, age, nationalId, team, teamName, teamMember]
  diagram.links = [
    new Connection(person.id, givenName.id, new Cardinality(0, 1), true),
    new Connection(person.id, surname.id, new Cardinality(0, 1), true),
    new Connection(person.id, age.id, new Cardinality(0, 1), true),
    new Connection(person.id, nationalId.id, new Cardinality(1, 1), true),
    new Connection(team.id, teamName.id, new Cardinality(0, 1), true),
    new Connection(team.id, teamMember.id, new Cardinality(0, 1), true),
    new Connection(person.id, teamMember.id, new Cardinality(0, 1), true),
  ]
  const identifier1 = new ErIdentifier(person.id, [givenName.id, surname.id, age.id], true)
  const identifier2 = new ErIdentifier(person.id, [nationalId.id], true)
  diagram.identifiers.push(identifier1, identifier2)
  person.identifiers.add(identifier1.id)
  person.identifiers.add(identifier2.id)
  const hierarchy1 = new ErIsaHierarchy(person.id, [student.id, teacher.id], true)
  diagram.hierarchies = [hierarchy1]
  // Simulate serialization and deserialization in order to ensure persistent
  // behavior across sessions.
  return {
    ...plainToInstance(DiagramModel, instanceToPlain(diagram)),
    selectedEntities: [],
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
  removeIdentifierById: (id: number) => void
  addIdentifier: (identifier: ErIdentifier) => void
  removeErDiagramEntityById: (id: number, type: ErDiagramEntityType) => void
}
export const useStore = create<StoreModel>()(
  devtools(
    persist(
      temporal(
        (set, get) => ({
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
          removeIdentifierById: (id: number) => {
            set(
              produce((state: StoreModel) => {
                const found = state.diagram.identifiers.find((i) => i.id === id)
                if (!found) {
                  console.error(`identifier ${id} not found`)
                  return
                }
                state.diagram.nodes.find((n) => n.id === found.identifies)?.identifiers.delete(found.id)
                state.diagram.identifiers = state.diagram.identifiers.filter((i) => i.id !== id)
              })
            )
          },
          addIdentifier: (identifier: ErIdentifier) => {
            set(
              produce((state: StoreModel) => {
                state.diagram.identifiers.push(identifier)
                state.diagram.nodes.find((n) => n.id === identifier.identifies)?.identifiers.add(identifier.id)
              })
            )
          },
          removeErDiagramEntityById: (id: number, type: ErDiagramEntityType): void => {
            set(
              produce((state: StoreModel) => {
                switch (type) {
                  case 'ErNode':
                    state.diagram.nodes = state.diagram.nodes.filter((n) => n.id !== id)
                    break
                  case 'ErConnection':
                    state.diagram.links = state.diagram.links.filter((l) => l.id !== id)
                    break
                  case 'ErIdentifier':
                    state.diagram.identifiers = state.diagram.identifiers.filter((i) => i.id !== id)
                    break
                  default:
                    throw new Error(`unknown type ${type}`)
                }
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
            let plain: StorageValue<DeepPartial<StoreModel>> | null = JSON.parse(localStorage.getItem(name) || 'null')
            if (plain === null) {
              plain = { state: { diagram: exampleDiagram() } }
            }
            plain.state.diagram = plainToInstance(DiagramModel, plain.state.diagram)
            return plain
          },
          // serialize
          setItem: (name: string, value: StorageValue<DeepPartial<StoreModel>>) => {
            value.state.diagram = instanceToPlain<DiagramModel>(value.state.diagram as DiagramModel)
            localStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name: string) => localStorage.removeItem(name),
        },
        name: 'schemcat-state',
        partialize: partializeStoreModel,
      }
    )
  )
)

/** Returns identifiers corresponding to a set of identifiers ids */
export const getIdentifiersByIds = (ids: Set<number>, identifiers: StoreModel['diagram']['identifiers']) =>
  identifiers.filter((identifier) => ids.has(identifier.id))

export const getIdentifierById = (id: number, identifiers: StoreModel['diagram']['identifiers']) => {
  const found = identifiers.find((identifier) => identifier.id === id)
  if (!found) {
    console.error(`Identifier ${id} not found`)
    throw Error(`Identifier ${id} not found`)
  }
  return found
}

function partializeStoreModel(state: StoreModel): DeepPartial<StoreModel> {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // ignore a part of the state
  const {
    isZoomPanSynced,
    diagram: { selectedEntities: selectedNodeIds, ...diagRest },
    ...rest
  } = state
  const partialized: DeepPartial<StoreModel> = { diagram: { ...diagRest }, ...rest }
  return partialized
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export const useTemporalStore = create(useStore.temporal)
