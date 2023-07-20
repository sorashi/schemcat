import 'reflect-metadata'
import { immerable } from 'immer'

import globalIdGenerator from '../utils/GlobalIdGenerator'
import { Transform, TransformFnParams, TransformationType, Type } from 'class-transformer'
import Vector2 from '../utils/Vector2'
import { assertNever, PartialRecord, ValueType } from '../utils/Types'
import { LineSegment } from '../utils/LineSegment'

export enum ControlPanelViewType {
  ViewOnly,
  NumericUpDown,
  TextEdit,
  ComboBox,
  AnchorPicker,
  Cardinality,
  ChildrenAnchors,
}

export const IncludeInControlPanelMetadataKey: unique symbol = Symbol('IncludeInControlPanelMetadataKey')
export const EnumTypeMetadataKey: unique symbol = Symbol('EnumTypeMetadataKey')

export class IncludeInControlPanelMetadata {
  controlPanelViewType: ControlPanelViewType
  propertyLabel: string | undefined
  constructor(controlPanelViewType: ControlPanelViewType, propertyLabel: string | undefined = undefined) {
    this.controlPanelViewType = controlPanelViewType
    this.propertyLabel = propertyLabel
  }
}

export function IncludeInControlPanel(viewType: ControlPanelViewType, propertyLabel: string | undefined = undefined) {
  return Reflect.metadata(IncludeInControlPanelMetadataKey, new IncludeInControlPanelMetadata(viewType, propertyLabel))
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

/**
 * Represents a non-rotated rectangle
 */
export class Rectangle {
  [immerable] = true
  x = 0
  y = 0
  width = 0
  height = 0

  get left() {
    return this.x
  }
  get right() {
    return this.x + this.width
  }
  get top() {
    return this.y
  }
  get bottom() {
    return this.y + this.height
  }
  get center(): Vector2 {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2)
  }
  getLineSegments(): LineSegment[] {
    const topLeft = new Vector2(this.x, this.y)
    const topRight = new Vector2(this.x + this.width, this.y)
    const bottomLeft = new Vector2(this.x, this.y + this.height)
    const bottomRight = new Vector2(this.x + this.width, this.y + this.height)
    return [
      { from: bottomRight, to: topRight },
      { from: topRight, to: topLeft },
      { from: topLeft, to: bottomLeft },
      { from: bottomLeft, to: bottomRight },
    ]
  }

  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
  toString(): string {
    return `${this.x} ${this.y} ${this.width} ${this.height}`
  }
}

export type ErDiagramEntityType = 'ErNode' | 'ErConnection' | 'ErIdentifier' | 'ErIsaHierarchy'
export type ErDiagramEntity = ErNode | Connection | ErIdentifier | ErIsaHierarchy
export interface ErDiagramIdentityDiscriminator {
  id: number
  type: ErDiagramEntityType
}

/**
 * (De)serialization transformation of Map<K, V>.
 * Should be supported by the [class-transformer](https://github.com/typestack/class-transformer)
 * library out-of-the-box, but it doesn't work for some reason.
 * Note that this transformation is currently only shallow (for our purposes),
 * and thus its generic parameters are restrained to {@link ValueType}.
 */
function mapTransformation<K extends ValueType, V extends ValueType>(params: TransformFnParams): Map<K, V> | [K, V][] {
  if (params.type === TransformationType.CLASS_TO_PLAIN) {
    const map: Map<K, V> = params.value
    const arr = []
    for (const entry of map.entries()) {
      arr.push(entry)
    }
    return arr
  } else if (params.type === TransformationType.PLAIN_TO_CLASS) {
    const arr: [K, V][] = params.value
    if (!Array.isArray(arr)) console.error('You are converting plainToInstance, but received instance, not plain!')
    const map: Map<K, V> = new Map<K, V>(arr)
    return map
  } else {
    const msg = `Unsupported transformation of Map<>: ${params.type}`
    console.error(msg)
    throw Error(msg)
  }
}

export class ErIsaHierarchy {
  [immerable] = true
  public id = -1
  public parent = -1
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker, 'parent anchor')
  public parentAnchor = Anchor.Left
  @Transform((value) => new Set(value.value))
  public children: Set<number> = new Set()
  @Transform(mapTransformation<number, Anchor>)
  @IncludeInControlPanel(ControlPanelViewType.ChildrenAnchors, 'children anchors')
  public childrenAnchors: Map<number, Anchor> = new Map<number, Anchor>()
  constructor(parent = -1, children: Iterable<number> | undefined = undefined, newId = false) {
    if (newId) this.id = globalIdGenerator.nextId()
    if (children) {
      this.children = new Set(children)
      this.children.forEach((c) => this.childrenAnchors.set(c, Anchor.Right))
    }
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
  @Type(() => Rectangle)
  public viewBox: Rectangle = new Rectangle(0, 0, 800, 800)
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
  height = 25
  constructor(label = 'Label', x = 0, y = 0, newId = false) {
    this.x = x
    this.y = y
    if (newId) this.id = globalIdGenerator.nextId()
    else this.id = -1
    this.label = label
  }
  getAnchorPoints(): PartialRecord<Anchor, Vector2> {
    return {}
  }
}
export enum ErNodeType {
  EntityType = 'Entity Type',
  AttributeType = 'Attribute Type',
  RelationshipType = 'Relationship Type',
}
export class ErNode extends DiagramNode {
  [immerable] = true
  // Uncomment to enable changing the type of a node in the control panel
  //@IncludeInControlPanel(ControlPanelViewType.ComboBox)
  //@EnumType(ErNodeType)
  type: ErNodeType
  /** Set of {@link ErIdentifier#id} */
  @Transform((value) => new Set(value.value))
  identifiers: Set<number> = new Set()
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker, 'attribute text position')
  attributeTextPosition: Anchor = Anchor.Right
  constructor(label = 'Label', type: ErNodeType = ErNodeType.EntityType, x = 0, y = 0, newId = false) {
    super(label, x, y, newId)
    this.type = type
  }
  getAnchorPoints(): PartialRecord<Anchor, Vector2> {
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

export const Cardinalities = {
  Default: new Cardinality(),
  ZeroOne: new Cardinality(CardinalityLowerBound.Zero, CardinalityUpperBound.One),
  ZeroMany: new Cardinality(CardinalityLowerBound.Zero, CardinalityUpperBound.Many),
  OneOne: new Cardinality(CardinalityLowerBound.One, CardinalityUpperBound.One),
  OneMany: new Cardinality(CardinalityLowerBound.One, CardinalityUpperBound.Many),
}

export class Connection {
  [immerable] = true
  id: number
  fromId: number
  toId: number
  @Type(() => Cardinality)
  @IncludeInControlPanel(ControlPanelViewType.Cardinality)
  cardinality: Cardinality
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker, 'anchor from')
  fromAnchor: Anchor
  @IncludeInControlPanel(ControlPanelViewType.AnchorPicker, 'anchor to')
  toAnchor: Anchor
  constructor(
    fromId = -1,
    toId = -1,
    cardinality = new Cardinality(),
    newId = false,
    fromAnchor: Anchor = Anchor.Center,
    toAnchor: Anchor = Anchor.Center
  ) {
    this.id = newId ? globalIdGenerator.nextId() : -1
    this.fromId = fromId
    this.toId = toId
    this.cardinality = cardinality
    this.fromAnchor = fromAnchor
    this.toAnchor = toAnchor
  }
}
