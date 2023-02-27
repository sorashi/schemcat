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
import { Transform, Type } from 'class-transformer'
import Vector2 from '../utils/Vector2'
import { assertNever } from '../utils/Types'

export enum ControlPanelViewType {
  ViewOnly,
  NumericUpDown,
  TextEdit,
  ComboBox,
  AnchorPicker,
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

export enum Anchor {
  TopLeft = 'top-left',
  Top = 'top',
  TopRight = 'top-right',
  Left = 'left',
  Center = 'center',
  Right = 'right',
  BottomLeft = 'bottom-left',
  Bottom = 'bottom',
  BottomRight = 'bottom-right',
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export type ErDiagramEntityType = 'ErNode' | 'ErConnection' | 'ErIdentifier' | 'ErIsaHierarchy'
export type ErDiagramEntity = ErNode | Connection | ErIdentifier
export interface ErDiagramIdentityDiscriminator {
  id: number
  type: ErDiagramEntityType
}

export class ErIsaHierarchy {
  [immerable] = true
  public id = -1
  public parent = -1
  @Transform((value) => new Set(value.value))
  public children: Set<number> = new Set()
  constructor(parent = -1, children: Iterable<number> | undefined = undefined, newId = false) {
    if (newId) this.id = globalIdGenerator.nextId()
    if (children) this.children = new Set(children)
    this.parent = parent
  }
}

/**
 * Identifier in the context of an ER diagram.
 * An identifier itself has an ID to uniquely identify it.
 * An identifier consists of a set of IDs of nodes that are part of the identifier.
 */
export class ErIdentifier {
  [immerable] = true
  public id = -1
  /** Which node by ID does this identifier identify */
  public identifies = -1
  @Transform((value) => new Set(value.value))
  public identities: Set<number> = new Set<number>()
  constructor(identifies = -1, identities: Iterable<number> | undefined = undefined, newId = false) {
    if (newId) this.id = globalIdGenerator.nextId()
    if (identities) this.identities = new Set(identities)
    this.identifies = identifies
  }
}

export class DiagramModel {
  [immerable] = true
  @Type(() => ErNode)
  public nodes: ErNode[] = []
  @Type(() => Connection)
  public links: Connection[] = []
  @Type(() => ErIdentifier)
  public identifiers: ErIdentifier[] = []
  @Type(() => ErIsaHierarchy)
  public hierarchies: ErIsaHierarchy[] = []

  /** IDs of diagram entities selected by the user.
   * This property does not need a `@Type` attribute, because the type is a list of interfaces, not of classes. */
  public selectedEntities: ErDiagramIdentityDiscriminator[] = []
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
  height = 0
  constructor(label = 'Label', x = 0, y = 0, newId = false) {
    this.x = x
    this.y = y
    if (newId) this.id = globalIdGenerator.nextId()
    else this.id = -1
    this.label = label
  }
  getAnchorPoints?: () => Record<Anchor, Vector2>
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
  /** Set of {@link ErIdentifier#id} */
  @Transform((value) => new Set(value.value))
  identifiers: Set<number> = new Set()
  constructor(label = 'Label', type: ErNodeType = ErNodeType.EntityType, x = 0, y = 0, newId = false) {
    super(label, x, y, newId)
    this.type = type
  }
  getAnchorPoints = (): Record<Anchor, Vector2> => {
    switch (this.type) {
      case ErNodeType.EntityType:
        return {
          [Anchor.TopLeft]: new Vector2(this.x, this.y),
          [Anchor.Top]: new Vector2(this.x + this.width / 2, this.y),
          [Anchor.TopRight]: new Vector2(this.x + this.width, this.y),
          [Anchor.Left]: new Vector2(this.x, this.y + this.height / 2),
          [Anchor.Center]: new Vector2(this.x + this.width / 2, this.y + this.height / 2),
          [Anchor.Right]: new Vector2(this.x + this.width, this.y + this.height / 2),
          [Anchor.BottomLeft]: new Vector2(this.x, this.y + this.height),
          [Anchor.Bottom]: new Vector2(this.x + this.width / 2, this.y + this.height),
          [Anchor.BottomRight]: new Vector2(this.x + this.width, this.y + this.height),
        }
      case ErNodeType.AttributeType: {
        // attribute type has all anchors in the center of the circle
        const pos = new Vector2(this.x, this.y)
        return {
          [Anchor.TopLeft]: pos,
          [Anchor.Top]: pos,
          [Anchor.TopRight]: pos,
          [Anchor.Left]: pos,
          [Anchor.Center]: pos,
          [Anchor.Right]: pos,
          [Anchor.BottomLeft]: pos,
          [Anchor.Bottom]: pos,
          [Anchor.BottomRight]: pos,
        }
      }
      case ErNodeType.RelationshipType:
        return {
          [Anchor.TopLeft]: new Vector2(this.x, this.y),
          [Anchor.Top]: new Vector2(this.x + this.width / 2, this.y),
          [Anchor.TopRight]: new Vector2(this.x + this.width, this.y),
          [Anchor.Left]: new Vector2(this.x, this.y + this.height / 2),
          [Anchor.Center]: new Vector2(this.x + this.width / 2, this.y + this.height / 2),
          [Anchor.Right]: new Vector2(this.x + this.width, this.y + this.height / 2),
          [Anchor.BottomLeft]: new Vector2(this.x, this.y + this.height),
          [Anchor.Bottom]: new Vector2(this.x + this.width / 2, this.y + this.height),
          [Anchor.BottomRight]: new Vector2(this.x + this.width, this.y + this.height),
        }
      default:
        return assertNever(this.type)
    }
  }

  getAnchorPoint(anchor: Anchor) {
    const anchorPoints = this.getAnchorPoints()
    return anchorPoints[anchor]
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
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker)
  fromAnchor: Anchor = Anchor.Right
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker)
  toAnchor: Anchor = Anchor.Left
  constructor(fromId = -1, toId = -1, multiplicity = new Cardinality(), newId = false) {
    this.id = newId ? globalIdGenerator.nextId() : -1
    this.fromId = fromId
    this.toId = toId
    this.multiplicity = multiplicity
  }
}
