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
  ErDiagramIdentityDiscriminator,
  ErDiagramEntity,
  Anchor,
} from '../model/DiagramModel'
import { create } from 'zustand'
import { devtools, persist, StorageValue } from 'zustand/middleware'
import { temporal } from 'zundo'
import { produce } from 'immer'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { assertNever, DeepPartial } from '../utils/Types'
import globalIdGenerator from '../utils/GlobalIdGenerator'
import { RunningMaximum } from '../utils/RunningMaximum'
import { DiagramType } from '../model/Constats'
import { SchemaCategoryEntityDiscriminator } from '../model/SchemcatModel'
import _ from 'lodash'

function exampleDiagram(): DiagramModel {
  const diagram = new DiagramModel()
  const person = new ErNode('Person', ErNodeType.EntityType, 20, 1, true)
  const student = new ErNode('Student', ErNodeType.EntityType, -190, -90, true)
  const teacher = new ErNode('Teacher', ErNodeType.EntityType, -190, 15, true)
  const givenName = new ErNode('givenName', ErNodeType.AttributeType, -60, 110, true)
  givenName.attributeTextPosition = Anchor.Left
  const surname = new ErNode('surname', ErNodeType.AttributeType, 10, 110, true)
  const nationalId = new ErNode('nationalId', ErNodeType.AttributeType, 70, -70, true)
  nationalId.width = 120
  const age = new ErNode('age', ErNodeType.AttributeType, 105, 110, true)
  const team = new ErNode('Team', ErNodeType.EntityType, 20, 200, true)
  const teamName = new ErNode('name', ErNodeType.AttributeType, 70, 300, true)
  const teamMember = new ErNode('member', ErNodeType.RelationshipType, 200, 150, true)
  diagram.nodes = [person, student, teacher, givenName, surname, age, nationalId, team, teamName, teamMember]
  diagram.links = [
    new Connection(person.id, givenName.id, new Cardinality(0, 1), true, Anchor.BottomLeft),
    new Connection(person.id, surname.id, new Cardinality(0, 1), true, Anchor.Bottom),
    new Connection(person.id, age.id, new Cardinality(0, 1), true, Anchor.BottomRight),
    new Connection(person.id, nationalId.id, new Cardinality(1, 1), true, Anchor.Top),
    new Connection(team.id, teamName.id, new Cardinality(0, 1), true, Anchor.Bottom),
    new Connection(team.id, teamMember.id, new Cardinality(0, 1), true, Anchor.Right, Anchor.BottomLeft),
    new Connection(person.id, teamMember.id, new Cardinality(0, 1), true, Anchor.BottomRight, Anchor.TopLeft),
  ]
  const identifier1 = new ErIdentifier(person.id, [givenName.id, surname.id, age.id], true)
  const identifier2 = new ErIdentifier(person.id, [nationalId.id], true)
  diagram.identifiers.push(identifier1, identifier2)
  person.identifiers.add(identifier1.id)
  person.identifiers.add(identifier2.id)
  const teamIdentifier = new ErIdentifier(team.id, [teamName.id], true)
  diagram.identifiers.push(teamIdentifier)
  team.identifiers.add(teamIdentifier.id)
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
  projectName: string
  activeDiagram: DiagramType | null
  selectedSchemcatEntity?: SchemaCategoryEntityDiscriminator
  setIsZoomPanSynced: (isLocked: boolean) => void
  updateDiagram: (update: (diagram: DiagramModel) => void) => void
  updateNode: (node: ErNode) => void
  /** removes the node and its connections from the diagram */
  removeNodeById: (id: number) => void
  /** calls and update function on the node */
  updateNodeById: (id: number, update: (node: DiagramNode) => void) => void
  updateConnectionById: (id: number, update: (node: Connection) => void) => void
  updateErEntityByDiscriminator: (
    discriminator: ErDiagramIdentityDiscriminator,
    update: (entity: ErDiagramEntity) => void
  ) => void
  removeIdentifierById: (id: number) => void
  addIdentifier: (identifier: ErIdentifier) => void
  removeErDiagramEntityById: (id: number, type: ErDiagramEntityType) => void
  setProjectName: (projectName: string) => void
  setActiveDiagram: (activeDiagram: DiagramType) => void
  setSelectedSchemcatEntity: (selectedSchemcatEntity?: SchemaCategoryEntityDiscriminator) => void
  deselect: () => void
}

export function getErEntityByDiscriminator(
  state: StoreModel,
  discriminator?: ErDiagramIdentityDiscriminator
): ErNode | Connection | ErIdentifier | ErIsaHierarchy | undefined {
  if (!discriminator) return undefined
  switch (discriminator.type) {
    case 'ErNode':
      return state.diagram.nodes.find((n) => n.id === discriminator.id)
    case 'ErConnection':
      return state.diagram.links.find((n) => n.id === discriminator.id)
    case 'ErIdentifier':
      return state.diagram.identifiers.find((n) => n.id === discriminator.id)
    case 'ErIsaHierarchy':
      return state.diagram.hierarchies.find((n) => n.id === discriminator.id)
    default:
      assertNever(discriminator.type)
  }
}

function getMaxIdFromModel(model: DeepPartial<StoreModel>) {
  const max = new RunningMaximum()
  max.add(model.diagram?.links?.map((x) => x?.id || -Infinity))
  max.add(model.diagram?.nodes?.map((x) => x?.id || -Infinity))
  max.add(model.diagram?.hierarchies?.map((x) => x?.id || -Infinity))
  max.add(model.diagram?.identifiers?.map((x) => x?.id || -Infinity))
  return Math.max(max.currentMax, 0)
}

export interface ValidationModel {
  dependencyCycle: boolean
  leaves: number[]
}
export const useValidtaionStore = create<ValidationModel>((set) => ({
  dependencyCycle: false,
  leaves: [],
}))

export const useStore = create<StoreModel>()(
  devtools(
    persist(
      temporal(
        (set) => ({
          diagram: exampleDiagram(),
          isZoomPanSynced: true,
          projectName: 'Untitled Diagram',
          activeDiagram: null,
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
          updateConnectionById: (id: number, update: (node: Connection) => void) => {
            set(
              produce((state) => {
                const index = state.diagram.links.findIndex((l: Connection) => l.id === id)
                if (index === -1) {
                  console.error(`connection ${id} not found`)
                  return
                }
                update(state.diagram.links[index])
              })
            )
          },
          updateErEntityByDiscriminator: (
            discriminator: ErDiagramIdentityDiscriminator,
            update: (entity: any) => void
          ) => {
            set(
              produce((state: StoreModel) => {
                let entity: any = undefined
                switch (discriminator.type) {
                  case 'ErNode':
                    entity = state.diagram.nodes.find((n) => n.id === discriminator.id)
                    break
                  case 'ErIdentifier':
                    entity = state.diagram.identifiers.find((i) => i.id === discriminator.id)
                    break
                  case 'ErConnection':
                    entity = state.diagram.links.find((l) => l.id === discriminator.id)
                    break
                  case 'ErIsaHierarchy':
                    entity = state.diagram.hierarchies.find((h) => h.id === discriminator.id)
                    break
                  default:
                    assertNever(discriminator.type)
                }
                update(entity)
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
                  case 'ErIsaHierarchy':
                    state.diagram.hierarchies = state.diagram.hierarchies.filter((i) => i.id !== id)
                    break
                  default:
                    assertNever(type)
                }
              })
            )
          },
          setProjectName: (projectName: string): void => {
            set(
              produce((state) => {
                state.projectName = projectName
              })
            )
          },
          setActiveDiagram: (activeDiagram: DiagramType): void => {
            set(
              produce((state) => {
                state.activeDiagram = activeDiagram
              })
            )
          },
          setSelectedSchemcatEntity: (selectedSchemcatEntity?: SchemaCategoryEntityDiscriminator): void => {
            set(
              produce((state) => {
                state.selectedSchemcatEntity = selectedSchemcatEntity
              })
            )
          },
          deselect: (): void => {
            set(
              produce((state) => {
                state.diagram.selectedEntities = []
              })
            )
          },
        }),
        {
          // limit: 50,
          // partialize: partializeStoreModel,
          handleSet: (handleSet) =>
            _.throttle<typeof handleSet>((state) => {
              handleSet(state)
            }, 1000),
        }
      ),
      {
        storage: {
          // deserialize
          getItem: (name: string) => {
            let plain: StorageValue<DeepPartial<StoreModel>> | null = JSON.parse(localStorage.getItem(name) || 'null')
            if (plain === null) {
              plain = { state: { diagram: instanceToPlain<DiagramModel>(exampleDiagram()) } }
            }
            plain.state.diagram = plainToInstance(DiagramModel, plain.state.diagram)
            globalIdGenerator.id = getMaxIdFromModel(plain.state)
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
    diagram: { selectedEntities: selectedNodeIds, ...diagRest },
    ...rest
  } = state
  const partialized: DeepPartial<StoreModel> = { diagram: { ...diagRest }, ...rest }
  return partialized
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export const useTemporalStore = create(useStore.temporal)

interface ZoomModel {
  zoom: string
  setZoom: (zoom: number) => void
  onResetZoom?: () => void
  setOnResetZoom: (onResetZoom: () => void) => void
}

export const useZoomStore = create<ZoomModel>((set) => ({
  zoom: '100',
  setZoom: (zoom) =>
    set(
      produce((state) => {
        state.zoom = zoom
      })
    ),
  setOnResetZoom: (onResetZoom: () => void) => {
    set(
      produce((state) => {
        state.onResetZoom = onResetZoom
      })
    )
  },
}))
