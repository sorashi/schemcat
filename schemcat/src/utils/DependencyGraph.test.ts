import { Vertex, DirectedGraph, DirectedEdge } from './DependencyGraph'

describe('isAcyclic', () => {
  test('finds loop', () => {
    const graph = new DirectedGraph()
    const node1 = new Vertex(1)
    const node2 = new Vertex(2)
    graph.nodes.push(node1, node2)
    graph.edges.push(new DirectedEdge(node1, node2), new DirectedEdge(node2, node1))
    expect(graph.isAcyclic()).toBe(false)
  })
})
