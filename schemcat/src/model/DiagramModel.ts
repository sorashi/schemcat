import 'reflect-metadata'
import { immerable } from 'immer'

import globalIdGenerator from '../utils/GlobalIdGenerator'
import { Transform, Type } from 'class-transformer'
import Vector2 from '../utils/Vector2'
import { assertNever, PartialRecord } from '../utils/Types'

export enum ControlPanelViewType {
  ViewOnly,
  NumericUpDown,
  TextEdit,
  ComboBox,
  AnchorPicker,
  Cardinality,
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
  getAnchorPoints?: () => PartialRecord<Anchor, Vector2>
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
  getAnchorPoints = (): PartialRecord<Anchor, Vector2> => {
    const top = this.y
    const bottom = this.y + this.height
    const left = this.x
    const right = this.x + this.width
    const centerX = this.x + this.width / 2
    const centerY = this.y + this.height / 2
    if (this.height === 0) console.warn('height is 0')
    switch (this.type) {
      case ErNodeType.EntityType:
        return {
          [Anchor.TopLeft]: new Vector2(left, top),
          [Anchor.Top]: new Vector2(centerX, top),
          [Anchor.TopRight]: new Vector2(right, top),
          [Anchor.Left]: new Vector2(left, centerY),
          [Anchor.Center]: new Vector2(centerX, centerY),
          [Anchor.Right]: new Vector2(right, centerY),
          [Anchor.BottomLeft]: new Vector2(left, bottom),
          [Anchor.Bottom]: new Vector2(centerX, bottom),
          [Anchor.BottomRight]: new Vector2(right, bottom),
        }
      case ErNodeType.AttributeType: {
        // attribute type has all anchors in the center of the circle
        const pos = new Vector2(this.x, this.y)
        return {
          [Anchor.Center]: pos,
        }
      }
      case ErNodeType.RelationshipType:
        return {
          [Anchor.TopLeft]: new Vector2(left, top),
          [Anchor.Top]: new Vector2(centerX, top),
          [Anchor.TopRight]: new Vector2(right, top),
          [Anchor.Left]: new Vector2(left, centerY),
          [Anchor.Center]: new Vector2(centerX, centerY),
          [Anchor.Right]: new Vector2(right, centerY),
          [Anchor.BottomLeft]: new Vector2(left, bottom),
          [Anchor.Bottom]: new Vector2(centerX, bottom),
          [Anchor.BottomRight]: new Vector2(right, bottom),
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
  @IncludeInControlPanel(ControlPanelViewType.Cardinality)
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
