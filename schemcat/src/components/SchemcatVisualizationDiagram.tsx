import { useMemo, useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { Cardinality, ErNodeType } from '../model'
import { DiagramSvgIds, DiagramType } from '../model/Constats'
import { erDiagramToSchemcat, SchemaCategory, SchemaMorphism, SchemaObject } from '../model/SchemcatModel'
import Vector2 from '../utils/Vector2'
import { CardinalityText } from './CardinalityText'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import PannableZoomableSvg from './PannableZoomableSvg'
import { groupBy } from '../utils/Array'
import { attributeCircleRadius, selectedStrokeStyle } from '../Constants'
import { PositionedSvgGroup } from './PositionedSvgGroup'
import { IdentifierFenceForSchemcatVisualization } from './IdentifierFence'

const objectCircleRadius = 18
export const schemcatVisRectangleWidth = 100
export const schemcatVisRectangleHeight = 50

interface SchemcatVisualizationDiagramProps {
  isSelectedNodeInActiveTabSet?: boolean
}

export function SchemcatVisualizationObjectView({
  object,
  schemcat,
}: {
  object: SchemaObject
  schemcat: SchemaCategory
}) {
  const diagram = useStore((state) => state.diagram)
  const node = diagram.nodes.find((n) => n.id === object.key)
  if (!node) throw new Error('could not find node')
  const renderRectangle = object.identifiers.size > 0

  const selectedSchemcatEntity = useStore((state) => state.selectedSchemcatEntity)
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)
  const onClick = () => setSelectedSchemcatEntity({ type: 'Object', id: object.key })

  if (renderRectangle)
    return (
      <>
        {[...object.identifiers.values()].map((x) => (
          <IdentifierFenceForSchemcatVisualization
            object={object}
            schemcat={schemcat}
            key={`${[...x.values()].map((x) => x.join('-'))}`}
            identifier={x}></IdentifierFenceForSchemcatVisualization>
        ))}
        <PositionedSvgGroup x={node.x} y={node.y} onClick={onClick}>
          <rect
            x={-schemcatVisRectangleWidth / 2}
            y={-schemcatVisRectangleHeight / 2}
            width={schemcatVisRectangleWidth}
            height={schemcatVisRectangleHeight}
            stroke='black'
            strokeWidth={1}
            fill='white'
            style={(selectedSchemcatEntity?.id == object.key && selectedStrokeStyle) || undefined}></rect>
          <text dominantBaseline='middle' textAnchor='middle' x={0} y={0} color='black'>
            {object.label}
          </text>
        </PositionedSvgGroup>
      </>
    )
  else
    return (
      <PositionedSvgGroup x={node.x} y={node.y} onClick={onClick}>
        <circle
          cx={0}
          cy={0}
          r={attributeCircleRadius}
          stroke='black'
          strokeWidth={1}
          fill='white'
          style={(selectedSchemcatEntity?.id == object.key && selectedStrokeStyle) || undefined}></circle>
        <text dominantBaseline='middle' x={objectCircleRadius + 2} y={0} textAnchor='left' color='black'>
          {object.label}
        </text>
      </PositionedSvgGroup>
    )
}

export function SchemcatVisualizationMorphism({ morphisms }: { morphisms: SchemaMorphism[] }) {
  const morphism = morphisms[0]
  const nodes = useStore((state) => state.diagram.nodes)
  const from = nodes.find((n) => n.id === morphism.domain)
  const to = nodes.find((n) => n.id === morphism.codomain)
  if (!from || !to) throw new Error('could not find morphism domain or codomain')
  const fromPos = new Vector2(from.x, from.y)
  const toPos = new Vector2(to.x, to.y)
  const cardinalityPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.5))
  const cardinalityBackPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.8))

  const selectedSchemcatEntity = useStore((state) => state.selectedSchemcatEntity)
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)

  return (
    <>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke='black'
        strokeWidth={1}
        style={(selectedSchemcatEntity?.id === morphism.signature[0] && selectedStrokeStyle) || undefined}
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke='rgba(240,0,0,0)'
        strokeWidth={10}
        onClick={(e) => setSelectedSchemcatEntity({ type: 'Morphism', id: morphisms[0].signature[0] })}
      />
      <CardinalityText
        x={cardinalityPosition.x}
        y={cardinalityPosition.y}
        cardinality={morphism.cardinality}
        pathId={''}
      />
      <CardinalityText
        x={cardinalityBackPosition.x}
        y={cardinalityBackPosition.y}
        cardinality={morphisms[1].cardinality}
        pathId={''}
      />
    </>
  )
}

export function SchemcatVisualizationDiagram({ isSelectedNodeInActiveTabSet }: SchemcatVisualizationDiagramProps) {
  const diagram = useStore((state) => state.diagram)
  const schemcat = useMemo(() => erDiagramToSchemcat(diagram), [diagram])
  const morphismGroups = groupBy(schemcat.morphisms, (m) => m.signature[0])
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)

  const svgRef = useRef(null)
  return (
    <div className='w-full h-full overflow-hidden'>
      <PannableZoomableSvg
        isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabSet}
        svgRef={svgRef}
        svgId={DiagramSvgIds[DiagramType.SchemcatVis]}
        onLeftClick={(e) => e.target === svgRef.current && setSelectedSchemcatEntity()}>
        <defs>
          <EmptyTriangleMarker />
          <TwoSidedMarker />
        </defs>
        {[...morphismGroups.values()].map((m) => {
          const mps = [...m]
          return (
            <SchemcatVisualizationMorphism
              key={`schemcat-vis-morphism-${mps[0].domain}-${mps[0].codomain}-${mps[0].signature.join('.')}`}
              morphisms={mps}
            />
          )
        })}
        {schemcat.objects.map((o) => (
          <SchemcatVisualizationObjectView schemcat={schemcat} key={`schmcat-vis-object-${o.key}`} object={o} />
        ))}
      </PannableZoomableSvg>
    </div>
  )
}
