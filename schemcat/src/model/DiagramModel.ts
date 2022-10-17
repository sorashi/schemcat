import "reflect-metadata"

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

export class DiagramModel {
    public nodes: DiagramNode[] = []
    public links: Connection[] = []
    public selectedNodeId?: number
}
export class DiagramNode {
    @IncludeInControlPanel(ControlPanelViewType.ViewOnly)
        id: number
    @IncludeInControlPanel(ControlPanelViewType.TextEdit)
        label: string
    @IncludeInControlPanel(ControlPanelViewType.ViewOnly)
        x = 0
    @IncludeInControlPanel(ControlPanelViewType.ViewOnly)
        y = 0
    selected = false
    constructor(label: string, x = 0, y = 0, id?: number) {
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
    @IncludeInControlPanel(ControlPanelViewType.ComboBox)
    @EnumType(ErNodeType)
        type: ErNodeType
    constructor(label: string, type: ErNodeType, x = 0, y = 0) {
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
    id: number
    from: DiagramNode
    to: DiagramNode
    multiplicity: string
    constructor(from: DiagramNode, to: DiagramNode, multiplicity: string, id?: number) {
        if (id) this.id = id
        else this.id = globalIdGenerator.nextId()
        this.from = from
        this.to = to
        this.multiplicity = multiplicity
    }
}

