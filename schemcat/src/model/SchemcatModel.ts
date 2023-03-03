import { Cardinality, DiagramModel } from './DiagramModel'

export class SchemaCategory {
  objects: SchemaObject[] = []
  morphisms: Morphism[] = []
}

export class SchemaObject {
  key = -1
  label = ''
  data: Set<number> = new Set()
  identifiers: Set<Set<number>> = new Set()
}

export class Morphism {
  signature: number[] = []
  domain = -1
  codomain = -1
  direction = 1
  label = ''
  cardinality: Cardinality = new Cardinality()
  duplicities = false
  ordering = false
}

export function erDiagramToSchemcat(diagram: DiagramModel): SchemaCategory {
  const schema = new SchemaCategory()

  // objects and identifiers
  diagram.nodes.forEach((node) => {
    const schemaObject = new SchemaObject()
    schemaObject.key = node.id
    schemaObject.label = node.label
    schemaObject.identifiers = new Set(
      diagram.identifiers.filter((id) => id.identifies === node.id).map((id) => id.identities)
    )
    // todo: add data
    schemaObject.data = new Set()
    schema.objects.push(schemaObject)
  })

  // morphisms
  diagram.links.forEach((link) => {
    const morphism = new Morphism()
    morphism.domain = link.fromId
    morphism.codomain = link.toId
    // signature
    morphism.signature = []
    morphism.label = ''
    morphism.cardinality = link.cardinality
    morphism.duplicities = false
    morphism.ordering = false
    schema.morphisms.push(morphism)
  })

  return schema
}
