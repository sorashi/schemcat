import 'reflect-metadata'
import { immerable } from 'immer'

import globalIdGenerator from '../utils/GlobalIdGenerator'

export enum ControlPanelViewType {
  ViewOnly,
  NumericUpDown,
  TextEdit,
  ComboBox,
}

export const IncludeInControlPanelMetadataKey: unique symbol = Symbol(
  'IncludeInControlPanelMetadataKey'
)
export const EnumTypeMetadataKey: unique symbol = Symbol('EnumTypeMetadataKey')

export class IncludeInControlPanelMetadata {
  controlPanelViewType: ControlPanelViewType
  constructor(controlPanelViewType: ControlPanelViewType) {
    this.controlPanelViewType = controlPanelViewType
  }
}

export function IncludeInControlPanel(viewType: ControlPanelViewType) {
  return Reflect.metadata(
    IncludeInControlPanelMetadataKey,
    new IncludeInControlPanelMetadata(viewType)
  )
}

export function EnumType(enumType: unknown) {
  return Reflect.metadata(EnumTypeMetadataKey, enumType)
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export class DiagramModel {
  [immerable] = true
  public nodes: DiagramNode[] = []
  public links: Connection[] = []
  public selectedNodeIds: Set<number> = new Set<number>()
  public viewBox: Rectangle = { x: 0, y: 0, width: 800, height: 800 }
}
export class DiagramNode {
  [immerable] = true
  @IncludeInControlPanel(ControlPanelViewType.ViewOnly)
  id: number
  @IncludeInControlPanel(ControlPanelViewType.TextEdit)
  label: string
  @IncludeInControlPanel(ControlPanelViewType.NumericUpDown)
  x = 0
  @IncludeInControlPanel(ControlPanelViewType.NumericUpDown)
  y = 0
  @IncludeInControlPanel(ControlPanelViewType.NumericUpDown)
  width = 90
  constructor(label = 'Label', x = 0, y = 0, newId = false) {
    this.x = x
    this.y = y
    if (newId) this.id = globalIdGenerator.nextId()
    else this.id = -1
    this.label = label
  }
  getAnchorPoints?: () => { x: number; y: number }[]
}
export enum ErNodeType {
  EntityType = 'Entity Type',
  AttributeType = 'Attribute Type',
  RelationshipType = 'Relationship Type',
}
export class ErNode extends DiagramNode {
  [immerable] = true
  @IncludeInControlPanel(ControlPanelViewType.ComboBox)
  @EnumType(ErNodeType)
  type: ErNodeType
  constructor(
    label = 'Label',
    type: ErNodeType = ErNodeType.EntityType,
    x = 0,
    y = 0,
    newId = false
  ) {
    super(label, x, y, newId)
    this.type = type
  }
  getAnchorPoints = () => {
    switch (this.type) {
      case ErNodeType.EntityType:
        return [{ x: this.x + this.width / 2, y: this.y }]
      case ErNodeType.AttributeType:
        return [{ x: this.x + 5, y: this.y + 5 }]
      case ErNodeType.RelationshipType:
        return [{ x: this.x + this.width / 2, y: this.y }]
      default:
        return [{ x: this.x + this.width / 2, y: this.y }]
    }
  }
}
export class Connection {
  [immerable] = true
  id: number
  fromId: number
  toId: number
  multiplicity: string
  constructor(
    fromId: number,
    toId: number,
    multiplicity: string,
    newId = false
  ) {
    this.id = newId ? globalIdGenerator.nextId() : -1
    this.fromId = fromId
    this.toId = toId
    this.multiplicity = multiplicity
  }
}
