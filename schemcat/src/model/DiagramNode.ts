import globalIdGenerator from "../utils/GlobalIdGenerator"

export class DiagramModel {
    public nodes: DiagramNode[] = []
    public links: Connection[] = []
}
export class DiagramNode {
    id: number
    label: string
    x = 0
    y = 0
    selected = false
    constructor(label: string, x = 0, y = 0, id?: number) {
        this.x = x
        this.y = y
        if (id) this.id = id
        else this.id = globalIdGenerator.nextId()
        this.label = label
    }
    getAnchorPoints?():{x: number, y: number}[]
}
export enum ErNodeType {
    Entity = "Entity",
    Attribute = "Attribute",
    Relationship = "Relationship"
}
export class ErNode extends DiagramNode {
    type: ErNodeType
    constructor(label: string, type: ErNodeType, x = 0, y = 0) {
        super(label, x, y)
        this.type = type
    }
    getAnchorPoints(): { x: number; y: number }[] {
        const width = 75, height = 75
        switch (this.type) {
        case "Entity":
            return [{ x: this.x + width / 2, y: this.y }]
        case "Attribute":
            return [{ x: this.x + 5, y: this.y + 75 / 2 }]
        case "Relationship":
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

export interface Model {
    diagram: DiagramModel,
    updateNode: (node: ErNode) => void
    refreshLinksFromToNode: (node: ErNode) => void
}