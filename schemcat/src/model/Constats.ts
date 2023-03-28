export function isDiagramTypeEnumValue(s: string): s is DiagramType {
  const values = Object.values(DiagramType)
  return values.some((x) => x == s)
}
export enum DiagramType {
  Er = 'ER Diagram',
  Schemcat = 'Schemcat Diagram',
  SchemcatVis = 'Schemcat Visualization Diagram',
}

export const DiagramSvgIds: Record<DiagramType, string> = {
  [DiagramType.Er]: 'erDiagram',
  [DiagramType.Schemcat]: 'schemcatDiagram',
  [DiagramType.SchemcatVis]: 'schemcatVisDiagram',
}
