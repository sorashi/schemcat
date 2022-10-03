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
    anchorPoints: { x: number, y: number }[] = []
    constructor(label: string, x = 0, y = 0, id?: number) {
        this.x = x
        this.y = y
        if (id) this.id = id
        else this.id = globalIdGenerator.nextId()
        this.label = label
    }
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