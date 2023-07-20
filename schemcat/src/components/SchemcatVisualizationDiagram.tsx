import { useMemo, useRef } from 'react'
import { useStore } from '../hooks/useStore'
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
import { Angle } from '../utils/Angle'
import SvgPathStringBuilder from '../utils/SvgPathStringBuilder'

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

export function SchemcatVisualizationMorphism({
  morphisms,
  schemcat,
}: {
  schemcat: SchemaCategory
  morphisms: SchemaMorphism[]
}) {
  if (!morphisms) return null
  const morphism = morphisms[0]
  const dual = morphisms[1]
  const nodes = useStore((state) => state.diagram.nodes)
  const from = nodes.find((n) => n.id === morphism.domain)
  const to = nodes.find((n) => n.id === morphism.codomain)
  if (!from || !to) throw new Error('could not find morphism domain or codomain')
  const fromVector = new Vector2(from.x, from.y)
  const toVector = new Vector2(to.x, to.y)
  const cardinalityPosition = fromVector.add(toVector.subtract(fromVector).multiply(0.5))
  const cardinalityBackPosition = fromVector.add(toVector.subtract(fromVector).multiply(0.8))

  const selectedSchemcatEntity = useStore((state) => state.selectedSchemcatEntity)
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)

  const similarMorphisms = schemcat.morphisms.filter(
    (x) => x.domain == morphism.domain && x.codomain == morphism.codomain
  )
  const thisMorphismIndex = similarMorphisms.findIndex((x) => x.signature[0] == morphism.signature[0])
  const directionVector = toVector.subtract(fromVector)
  const perpDir = directionVector.rotate(Angle.rightAngle).normalize()
  const perpLineLength = 100
  const perpLineFrom = fromVector.add(directionVector.multiply(0.5).subtract(perpDir.multiply(perpLineLength / 2)))
  const perpLineTo = fromVector.add(directionVector.multiply(0.5).add(perpDir.multiply(perpLineLength / 2)))
  const perpLineVector = perpLineTo.subtract(perpLineFrom)
  const curvePoint = perpLineFrom.add(perpLineVector.multiply((1 / similarMorphisms.length) * thisMorphismIndex))
  const pathSb = new SvgPathStringBuilder()
  pathSb.start(fromVector)
  pathSb.quadraticBezier(curvePoint, toVector)
  const onClick = () => setSelectedSchemcatEntity({ type: 'Morphism', id: morphism.signature[0] })
  const cardinalityPositionCoefficient = 0.6
  const curveCardinalityPosition = fromVector.add(
    curvePoint.subtract(fromVector).multiply(cardinalityPositionCoefficient)
  )
  const curveBackCardinalityPosition = toVector.add(
    curvePoint.subtract(toVector).multiply(cardinalityPositionCoefficient)
  )

  return (
    <>
      {similarMorphisms.length > 1 ? (
        <>
          <path d={pathSb.toString()} stroke='black' strokeWidth={1} fill='none'></path>
          <path d={pathSb.toString()} stroke='rgba(240, 0, 0, 0)' strokeWidth={5} onClick={onClick} fill='none'></path>
          <CardinalityText
            x={curveCardinalityPosition.x}
            y={curveCardinalityPosition.y}
            cardinality={morphism.cardinality}
            pathId={''}
          />
          <text
            x={curvePoint.x + 5}
            y={curvePoint.y}
            dominantBaseline='middle'
            alignmentBaseline='middle'
            textAnchor='start'>
            {morphism.signature[0]}
          </text>
          <CardinalityText
            x={curveBackCardinalityPosition.x}
            y={curveBackCardinalityPosition.y}
            cardinality={dual.cardinality}
            pathId={''}
          />
        </>
      ) : (
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
            onClick={onClick}
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
      )}
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
              schemcat={schemcat}
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
