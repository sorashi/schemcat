import { DiagramModel, ErNodeType } from '../model'

export class DirectedGraph {
  public nodes: Vertex[] = []
  public edges: DirectedEdge[] = []
  getNeighbors(node: Vertex): Vertex[] {
    return this.edges.filter((x) => x.from.id == node.id).map((x) => x.to)
  }
  public getTopologicalOrdering(): number[] {
    const stack: number[] = []
    const visited = new Set<number>()

    const dfs = (node: Vertex) => {
      visited.add(node.id)
      const neighbors = this.getNeighbors(node)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          dfs(neighbor)
        }
      }
      stack.unshift(node.id)
    }

    for (const node of this.nodes) {
      if (!visited.has(node.id)) {
        dfs(node)
      }
    }
    return stack
  }
  public isAcyclic(): boolean {
    const visited = new Set<number>()
    const path = new Set<number>()
    /** Returns true if cycle is detected */
    const dfs = (node: Vertex): boolean => {
      if (path.has(node.id)) return true
      path.add(node.id)
      visited.add(node.id)
      const neighbors = this.getNeighbors(node)
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id) && dfs(neighbor)) return true
        else if (path.has(neighbor.id)) return true
      }

      path.delete(node.id)
      return false
    }
    for (const node of this.nodes) {
      if (!visited.has(node.id) && dfs(node)) {
        return false
      }
    }
    return true
  }
}
export class Vertex {
  id: number
  constructor(id: number) {
    this.id = id
  }
}
export class DirectedEdge {
  from: Vertex
  to: Vertex
  constructor(from: Vertex, to: Vertex) {
    this.from = from
    this.to = to
  }
}
/**
 * Builds a hierarchy and identifier dependency graph from ER.
 */
export function getDependencyGraph(diagram: DiagramModel): DirectedGraph {
  const graph = new DirectedGraph()
  // nodes from entity types
  for (let i = 0; i < diagram.nodes.length; i++) {
    if (diagram.nodes[i].type !== ErNodeType.EntityType) continue
    graph.nodes.push(new Vertex(diagram.nodes[i].id))
  }
  // edges from external identifiers
  for (let i = 0; i < diagram.identifiers.length; i++) {
    const identifier = diagram.identifiers[i]
    const nodeFrom = graph.nodes.find((x) => x.id === identifier.identifies)
    if (!nodeFrom) throw new Error('Identifier does not identify an entity type')
    for (const identity of identifier.identities.values()) {
      const erNode = diagram.nodes.find((x) => x.id === identity)
      if (!erNode) throw new Error('Identifier references a non-existent diagram node: ' + identity)
      if (erNode.type !== ErNodeType.RelationshipType) continue
      const dependenciesNodeIds = diagram.links
        .filter((link) => {
          return (
            link.fromId !== nodeFrom.id &&
            link.toId !== nodeFrom.id &&
            (link.fromId === erNode.id || link.toId === erNode.id)
          )
        })
        .map((link) => (link.toId === erNode.id ? link.fromId : link.toId))
      const nodesTo = dependenciesNodeIds.map((x) => graph.nodes.find((n) => n.id === x))
      if (!nodesTo.every((x): x is Vertex => !!x)) throw new Error('Invalid external identifier')
      graph.edges.push(...nodesTo.map((nodeTo) => new DirectedEdge(nodeFrom, nodeTo)))
    }
  }
  // edges from hierarchies
  for (let i = 0; i < diagram.hierarchies.length; i++) {
    const hierarchy = diagram.hierarchies[i]
    const parentNode = graph.nodes.find((x) => x.id === hierarchy.parent)
    if (!parentNode) throw new Error('Invalid hierarchy -- the parent is not an entity type')
    for (const child of hierarchy.children.values()) {
      const childNode = graph.nodes.find((x) => x.id === child)
      if (!childNode) throw new Error(`Invalid hierarchy -- child (id: ${child}) is not an entity type`)
      graph.edges.push(new DirectedEdge(childNode, parentNode))
    }
  }
  return graph
}
