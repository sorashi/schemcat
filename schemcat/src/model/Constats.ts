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
