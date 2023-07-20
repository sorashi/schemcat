import { useStore, useValidtaionStore } from '../hooks/useStore'
import { Cardinalities, Cardinality, DiagramModel, ErNode, ErNodeType } from '../model'
import { getLinks } from '../model/SchemcatModel'

interface IdentifierLinkInfo {
  fromNode: ErNode
  toNode: ErNode
  cardinality: Cardinality
}

export function getNonOneOneIdentifiers(diagram: DiagramModel): IdentifierLinkInfo[] {
  return diagram.identifiers
    .filter((x) => x.identities.size == 1)
    .map((x) =>
      diagram.links.find(
        (l) =>
          (l.fromId == x.identities.values().next().value && l.toId == x.identifies) ||
          (l.toId == x.identities.values().next().value && l.fromId == x.identifies)
      )
    )
    .filter((x) => !x?.cardinality.isDefault())
    .map((x) => ({
      fromNode: diagram.nodes.find((n) => n.id == x?.fromId),
      toNode: diagram.nodes.find((n) => n.id == x?.toId),
      cardinality: x?.cardinality,
    }))
    .filter((n): n is IdentifierLinkInfo => !!n.fromNode && !!n.toNode)
}
function getAttributesThatCannotBeComposite(diagram: DiagramModel): ErNode[] {
  const compositeAttributes = diagram.nodes
    .filter((x) => x.type === ErNodeType.AttributeType)
    .filter((x) => getLinks(diagram, x.id).some((l) => l.toNode?.type === ErNodeType.AttributeType))
  const cannotBeComposite: Set<ErNode> = new Set<ErNode>()
  for (const compositeAtt of compositeAttributes) {
    for (const attLink of getLinks(diagram, compositeAtt.id).filter(
      (x) => x.toNode?.type === ErNodeType.AttributeType
    )) {
      if (!attLink.toNode) continue
      if (
        getLinks(diagram, attLink.to).some((x) => x.toNode?.type == ErNodeType.AttributeType && x.to != compositeAtt.id)
      ) {
        cannotBeComposite.add(attLink.toNode)
      }
    }
  }
  return [...cannotBeComposite]
}

export function Validations() {
  const diagram = useStore((state) => state.diagram)
  const dependencyCycle = useValidtaionStore((state) => state.dependencyCycle)

  const leaves = useValidtaionStore((state) => state.leaves)
  const leafNodesWithoutIdentifiers = diagram.nodes
    .filter((x) => leaves.some((l) => l == x.id))
    .filter((n) => n.identifiers.size == 0)

  const nonOneOneIdentifiers = getNonOneOneIdentifiers(diagram)

  const cannotBeComposite = getAttributesThatCannotBeComposite(diagram)
  return (
    <div className='w-full h-full'>
      {dependencyCycle && <ValidationError message='Dependency cycle detected in ER.'></ValidationError>}
      {leafNodesWithoutIdentifiers.map((n) => (
        <ValidationError
          key={`validation-${n.id}-no-ident`}
          message={`Entity Type with id ${n.id} (${n.label}) has no identifier. It must have at least one.`}></ValidationError>
      ))}
      {nonOneOneIdentifiers.map((n) => (
        <ValidationError
          key={`non-1,1-ident-${n.fromNode.id}-${n.toNode.id}`}
          message={`Connection from ${n.fromNode.id} (${n.fromNode.label}) to ${n.toNode.id} (${n.toNode.label}) has cardinality ${n.cardinality}, but it is an identifier, so it must be ${Cardinalities.Default}`}></ValidationError>
      ))}
      {[...cannotBeComposite.values()].map((n) => (
        <ValidationError
          key={`att-cannot-be-composibte-${n.id}`}
          message={`Attribute ${n.id} (${n.label}) must not be composite, because it is already an attribute of another composite attribute.`}></ValidationError>
      ))}
    </div>
  )
}

interface ValidationErrorProps {
  message: string
}
export function ValidationError({ message }: ValidationErrorProps) {
  return <div className='w-full bg-red-300 p-0 pl-3 border border-red-900 mb-1'>{message}</div>
}
