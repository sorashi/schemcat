import "reflect-metadata"
import { immerable } from "immer"

import globalIdGenerator from "../utils/GlobalIdGenerator"

export enum ControlPanelViewType {
    ViewOnly,
    NumericUpDown,
    TextEdit,
    ComboBox
}

export const IncludeInControlPanelMetadataKey: unique symbol = Symbol("IncludeInControlPanelMetadataKey")
export const EnumTypeMetadataKey: unique symbol = Symbol("EnumTypeMetadataKey")

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
    public nodes: DiagramNode[] = []
    public links: Connection[] = []
    public selectedNodeId?: number
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
    selected = false
    constructor(label = "Label", x = 0, y = 0, id?: number) {
        this.x = x
        this.y = y
        if (id) this.id = id
        else this.id = globalIdGenerator.nextId()
        this.label = label
    }
    getAnchorPoints?: () => {x: number, y: number}[]
}
export enum ErNodeType {
    EntityType = "EntityType",
    AttributeType = "AttributeType",
    RelationshipType = "RelationshipType"
}
export class ErNode extends DiagramNode {
    [immerable] = true
    @IncludeInControlPanel(ControlPanelViewType.ComboBox)
    @EnumType(ErNodeType)
        type: ErNodeType
    constructor(label = "Label", type: ErNodeType = ErNodeType.EntityType, x = 0, y = 0) {
        super(label, x, y)
        this.type = type
    }
    getAnchorPoints = () => {
        const width = 90, height = 70
        switch (this.type) {
        case ErNodeType.EntityType:
            return [{ x: this.x + width / 2, y: this.y }]
        case ErNodeType.AttributeType:
            return [{ x: this.x + 5, y: this.y + 75 / 2 }]
        case ErNodeType.RelationshipType:
            return [{ x: this.x + width / 2, y: this.y}]
        default:
            return [{ x: this.x + width / 2, y: this.y }]
        }
    }
}
export class Connection {
    [immerable] = true
    id: number
    fromId: number
    toId: number
    multiplicity: string
    constructor(fromId: number, toId: number, multiplicity: string, id?: number) {
        if (id) this.id = id
        else this.id = globalIdGenerator.nextId()
        this.fromId = fromId
        this.toId = toId
        this.multiplicity = multiplicity
    }
}

