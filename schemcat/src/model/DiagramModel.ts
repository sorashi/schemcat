/**
 * The entry point to the Schemcat model.
 *
 * When writing a new class, make sure it has a parameter-less constructor (it can have all parameters with a specified default value).
 * This is in order for each class to have a default instance to which we can assign a plain JS object.
 * That is done when deserializing the model from a source that creates plain JS objects.
 * Then, for all properties of a class type that are expected to be a class instance, an attribute specifying the type is required, otherwise it won't be deserializable.
 * Note that
 * - union types,
 * - explicit exclusion and inclusion,
 * - and inclusion of computed properties (including get accessors and function values)
 * are supported, among other things.
 * See the [`class-transformer` documentation](https://github.com/typestack/class-transformer#working-with-nested-objects).
 *
 * Furthermore, make sure that the class has a property [immerable] = true.
 * That is needed for `immer` to draft the class and preserve its prototype chain.
 *
 * Also, make sure the model has no internal references and no instance is directly referenced by more than one other instance (there is only an owner).
 * This can be achieved by using internal IDs instead of object references.
 * This is because in React we must consider everything immutable (like in pure functional programming).
 * Instead of mutating, a new object is created, but it doesn't mutate other referenced instances which leads to state inconsistency.
 *
 * To summarize, all restrictions on the model are:
 * 1. Each class has a parameter-less constructor.
 * 2. Each class has the property [immerable] = true.
 * 3. Each class has `@Type` annotations on properties that need it.
 * 4. The whole model should form an arborescence structure (a directed rooted tree where the underlying graph has no cycles).
 * @module
 */

import 'reflect-metadata'
import { immerable } from 'immer'

import globalIdGenerator from '../utils/GlobalIdGenerator'
import { Type } from 'class-transformer'

export enum ControlPanelViewType {
  ViewOnly,
  NumericUpDown,
  TextEdit,
  ComboBox,
}

export const IncludeInControlPanelMetadataKey: unique symbol = Symbol('IncludeInControlPanelMetadataKey')
export const EnumTypeMetadataKey: unique symbol = Symbol('EnumTypeMetadataKey')

export class IncludeInControlPanelMetadata {
  controlPanelViewType: ControlPanelViewType
  constructor(controlPanelViewType: ControlPanelViewType) {
    this.controlPanelViewType = controlPanelViewType
  }
}

export function IncludeInControlPanel(viewType: ControlPanelViewType) {
  return Reflect.metadata(IncludeInControlPanelMetadataKey, new IncludeInControlPanelMetadata(viewType))
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
  @Type(() => DiagramNode)
  public nodes: DiagramNode[] = []
  @Type(() => Connection)
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
  identifiers: number[][] = []
  constructor(label = 'Label', type: ErNodeType = ErNodeType.EntityType, x = 0, y = 0, newId = false) {
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

export enum CardinalityLowerBound {
  Zero = 0,
  One = 1,
}

export enum CardinalityUpperBound {
  One = 1,
  Many = '*',
}

export class Cardinality {
  [immerable] = true
  lowerBound: CardinalityLowerBound
  upperBound: CardinalityUpperBound

  constructor(
    lower: CardinalityLowerBound = CardinalityLowerBound.One,
    upper: CardinalityUpperBound = CardinalityUpperBound.One
  ) {
    this.lowerBound = lower
    this.upperBound = upper
  }

  isDefault(): boolean {
    return this.lowerBound === CardinalityLowerBound.One && this.upperBound === CardinalityUpperBound.One
  }
}

export class Connection {
  [immerable] = true
  id: number
  fromId: number
  toId: number
  @Type(() => Cardinality)
  multiplicity: Cardinality
  constructor(fromId = -1, toId = -1, multiplicity = new Cardinality(), newId = false) {
    this.id = newId ? globalIdGenerator.nextId() : -1
    this.fromId = fromId
    this.toId = toId
    this.multiplicity = multiplicity
  }
}
