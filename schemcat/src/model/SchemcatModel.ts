import { produce } from 'immer'
import { ValidationModel, useValidtaionStore } from '../hooks/useStore'
import { getDependencyGraph } from '../utils/DependencyGraph'
import {
  Cardinalities,
  Cardinality,
  CardinalityUpperBound,
  Connection,
  DiagramModel,
  ErNode,
  ErNodeType,
} from './DiagramModel'

export class SchemaCategory {
  objects: SchemaObject[] = []
  morphisms: SchemaMorphism[] = []
}

export class SchemaObject {
  key = -1
  label = ''
  identifiers: Set<Set<Signature>> = new Set()
}

export type Signature = number[]
export function concatSignatures(one: Signature, other: Signature): Signature {
  return one.concat(other)
}

export class SchemaMorphism {
  respectiveErConnectionId = -1
  signature: Signature = []
  domain = -1
  codomain = -1
  label = ''
  cardinality: Cardinality = new Cardinality()
  duplicities = false
  ordering = false
}

export interface SchemaCategoryEntityDiscriminator {
  type: 'Object' | 'Morphism'
  id: number
}

interface LinkInfo {
  to: number
  link: Connection
  toNode?: ErNode
}
function getLinks(diagram: DiagramModel, from: number): LinkInfo[] {
  return diagram.links
    .filter((x) => x.fromId == from || x.toId == from)
    .map((x) => {
      const to = x.fromId == from ? x.toId : x.fromId
      return { to: to, link: x, toNode: diagram.nodes.find((x) => x.id === to) }
    })
}

function createMutuallyDualMorphisms(
  siganture: number,
  domain: number,
  codomain: number,
  cardinalityThere: Cardinality,
  cardinalityBack: Cardinality
): SchemaMorphism[] {
  const morphism = new SchemaMorphism()
  morphism.signature = [siganture]
  morphism.domain = domain
  morphism.codomain = codomain
  morphism.cardinality = cardinalityThere
  const dualMorphism = new SchemaMorphism()
  dualMorphism.signature = [siganture]
  dualMorphism.domain = codomain
  dualMorphism.codomain = domain
  dualMorphism.cardinality = cardinalityBack
  return [morphism, dualMorphism]
}

/**
 * Creates and schema object from an ER node, but without resolving identifiers.
 */
function erNodeToObject(node: ErNode): SchemaObject {
  const ob = new SchemaObject()
  ob.key = node.id
  ob.label = node.label
  return ob
}

export function erDiagramToSchemcat(diagram: DiagramModel): SchemaCategory {
  const graph = getDependencyGraph(diagram)

  useValidtaionStore.setState(
    produce((state: ValidationModel) => {
      state.dependencyCycle = !graph.isAcyclic()
    }),
    true
  )

  const schema = new SchemaCategory()

  if (!graph.isAcyclic()) return schema

  const entityTypeTransformationOrder = graph.getTopologicalOrdering()

  // attributes and composite attributes -> objects
  diagram.nodes
    .filter((x) => x.type == ErNodeType.AttributeType)
    .forEach((att) => {
      const ob = new SchemaObject()
      ob.key = att.id
      ob.label = att.label
      schema.objects.push(ob)
    })
  // composite attribute: morphisms to its attributes
  for (const compositeAttribute of diagram.nodes
    .filter((x) => x.type == ErNodeType.AttributeType)
    .filter((x) =>
      diagram.links
        .filter((link) => link.fromId === x.id || link.toId === x.id)
        .map((l) => (l.fromId === x.id ? l.toId : l.fromId))
        .some((l) => diagram.nodes.find((n) => n.id === l)?.type === ErNodeType.EntityType)
    )) {
    const subAttributeLinks = diagram.links
      .filter((x) => x.fromId == compositeAttribute.id || x.toId == compositeAttribute.id)
      .filter((x) => {
        const id = x.fromId === compositeAttribute.id ? x.toId : x.fromId
        return diagram.nodes.find((n) => n.id == id)?.type === ErNodeType.AttributeType
      })
    for (const subAttLink of subAttributeLinks) {
      const subAttId = subAttLink.fromId === compositeAttribute.id ? subAttLink.toId : subAttLink.fromId
      schema.morphisms.push(
        ...createMutuallyDualMorphisms(
          subAttLink.id,
          compositeAttribute.id,
          subAttId,
          Cardinalities.OneOne,
          Cardinalities.OneMany
        )
      )
    }
  }
  // entity type -> object
  for (const node of diagram.nodes.filter((x) => x.type === ErNodeType.EntityType)) {
    const ob = erNodeToObject(node)
    schema.objects.push(ob)
    // attribute of entity type: morphisms
    for (const attLink of getLinks(diagram, node.id)) {
      const attNode = attLink.toNode
      if (!attNode || attNode.type !== ErNodeType.AttributeType) continue
      const isSimpleIdentifier = diagram.identifiers
        .filter((x) => node.identifiers.has(x.id))
        .some((x) => x.identities.has(attNode.id))
      schema.morphisms.push(
        ...createMutuallyDualMorphisms(
          attLink.link.id,
          ob.key,
          attNode.id,
          attLink.link.cardinality,
          isSimpleIdentifier ? Cardinalities.OneOne : Cardinalities.OneMany
        )
      )
    }
  }
  // relationship type -> object and morphisms
  for (const relationshipType of diagram.nodes.filter((x) => x.type === ErNodeType.RelationshipType)) {
    const ob = erNodeToObject(relationshipType)
    schema.objects.push(ob)
    // attribute morphisms
    const links = getLinks(diagram, relationshipType.id)
    for (const attLink of links.filter((x) => x.toNode?.type === ErNodeType.AttributeType)) {
      schema.morphisms.push(
        ...createMutuallyDualMorphisms(
          attLink.link.id,
          relationshipType.id,
          attLink.to,
          attLink.link.cardinality,
          Cardinalities.OneMany
        )
      )
    }
    // entity morphisms
    const existsParticipantWithUpperCardinalityOne = links
      .filter((x) => x.toNode?.type === ErNodeType.EntityType)
      .some((e) => e.link.cardinality.upperBound === CardinalityUpperBound.One)
    for (const entityLink of links.filter((x) => x.toNode?.type === ErNodeType.EntityType)) {
      let cardinalityBack = Cardinalities.OneOne
      if (
        existsParticipantWithUpperCardinalityOne &&
        entityLink.link.cardinality.upperBound != CardinalityUpperBound.One
      )
        cardinalityBack = Cardinalities.OneMany
      schema.morphisms.push(
        ...createMutuallyDualMorphisms(
          entityLink.link.id,
          relationshipType.id,
          entityLink.to,
          entityLink.link.cardinality,
          cardinalityBack
        )
      )
    }
  }

  // entity identifiers
  while (entityTypeTransformationOrder.length > 0) {
    const currentEntityId = entityTypeTransformationOrder.pop() as number
    const erNode = diagram.nodes.find((x) => x.id == currentEntityId)
    if (!erNode) throw new Error('Could not find erNode with id: ' + currentEntityId)
    const schemaObject = schema.objects.find((x) => x.key === currentEntityId)
    if (!schemaObject) throw new Error('Could not find schema object with id: ' + currentEntityId)
    for (const identifierId of erNode.identifiers.values()) {
      const identifier = diagram.identifiers.find((x) => x.id == identifierId)
      if (!identifier) continue
      const objectIdentifier = new Set<Signature>()
      for (const identity of identifier.identities) {
        const identityNode = diagram.nodes.find((x) => x.id == identity)
        if (!identityNode) {
          console.error('Could not find identity node with id: ' + identity)
          continue
        }
        // the identity is a direct attribute of this entity type
        if (identityNode.type === ErNodeType.AttributeType) {
          const morphism = schema.morphisms.find((x) => x.domain === currentEntityId && x.codomain === identity)
          if (!morphism)
            throw new Error('Entity type is identified by its attribute, but the respective morphism was not found')
          objectIdentifier.add(morphism.signature)
        } else if (identityNode.type === ErNodeType.RelationshipType) {
          // an external identity
          const morphism = schema.morphisms.find((m) => m.domain == schemaObject.key && m.codomain == identityNode.id)
          if (!morphism) throw new Error('Could not find morphism')
          for (const participantLink of getLinks(diagram, identityNode.id)) {
            if (participantLink.toNode?.type !== ErNodeType.EntityType || participantLink.to == currentEntityId)
              continue
            // thanks to topological order, the participant must have already been resolved, so we can proceed safely
            const participantSchemaObject = schema.objects.find((x) => x.key == participantLink.to)
            if (!participantSchemaObject) throw new Error('Participant schema object was not found')
            const pathSignatureFromEntityObject = concatSignatures([participantLink.link.id], morphism.signature)
            const pathSignatureFromIdentityNodeObject = [participantLink.link.id]
            const concatenatedSignatures = [...participantSchemaObject.identifiers.values()].flatMap(
              (participantIdentifier) =>
                [...participantIdentifier.values()].map((signature) =>
                  concatSignatures(signature, pathSignatureFromEntityObject)
                )
            )
            concatenatedSignatures.forEach((cs) => objectIdentifier.add(cs))
            // on an unrelated note, add identifiers to relationship type object
            const relationshipTypeSchemaObject = schema.objects.find((x) => x.key == identityNode.id)
            if (!relationshipTypeSchemaObject) throw new Error('Relationship type not found: ' + identityNode.id)
            const relationshipTypeConcatenatedSignatures = [...participantSchemaObject.identifiers.values()].flatMap(
              (participantIdentifier) =>
                [...participantIdentifier.values()].map((signature) =>
                  concatSignatures(signature, pathSignatureFromIdentityNodeObject)
                )
            )
            const relationshipTypeIdentifier = new Set<Signature>()
            relationshipTypeConcatenatedSignatures.forEach((cs) => relationshipTypeIdentifier.add(cs))
            relationshipTypeSchemaObject.identifiers.add(relationshipTypeIdentifier)
          }
        } else {
          // cannot be nothing else
          throw new Error('Invalid identity: ' + identityNode.label)
        }
        schemaObject.identifiers.add(objectIdentifier)
      }
    }
  }
  // rest of relationship type identifiers
  for (const relationshipType of diagram.nodes.filter((n) => n.type === ErNodeType.RelationshipType)) {
    const ob = schema.objects.find((x) => x.key == relationshipType.id)
    if (!ob) throw new Error('Object for a relationship type not found')
    if (ob.identifiers.size > 0) continue
    const participantLinks = getLinks(diagram, relationshipType.id).filter(
      (x) => x.toNode?.type == ErNodeType.EntityType
    )
    const participantLinksWithMaxOne = participantLinks.filter(
      (et) => et.link.cardinality.upperBound == CardinalityUpperBound.One
    )
    const linksToConcatWith = participantLinksWithMaxOne.length > 0 ? participantLinksWithMaxOne : participantLinks
    for (const linkToConcatWith of linksToConcatWith) {
      const toObject = schema.objects.find((x) => x.key === linkToConcatWith.to)
      if (!toObject) throw new Error('Object could not be found')
      const concatenatedSignatures = [...toObject.identifiers.values()].map((id) =>
        [...id.values()].map((signature) => concatSignatures(signature, [linkToConcatWith.link.id]))
      )
      concatenatedSignatures.forEach((s) => ob.identifiers.add(new Set(s)))
    }
  }

  // finally -- hierarchies
  for (const hierarchy of diagram.hierarchies) {
    const parent = hierarchy.parent
    const parentObject = schema.objects.find((x) => x.key == parent)
    const ids = hierarchy.getIdsForIdentities()
    let i = 0
    if (!parentObject) throw new Error('Could not find parent object of a hierarchy')
    for (const child of hierarchy.children.values()) {
      const childObject = schema.objects.find((x) => x.key == child)
      if (!childObject) throw new Error('Could not find child object of a hierarchy')
      schema.morphisms.push(
        ...createMutuallyDualMorphisms(ids[i++], child, parent, Cardinalities.OneOne, Cardinalities.OneOne)
      )
      const concatenatedIdentifiers = [...parentObject.identifiers.values()].map((id) =>
        [...id.values()].map((v) => concatSignatures(v, [hierarchy.id]))
      )
      concatenatedIdentifiers.forEach((ci) => {
        childObject.identifiers.add(new Set(ci))
      })
    }
  }

  return schema
}
