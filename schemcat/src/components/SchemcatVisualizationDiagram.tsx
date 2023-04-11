import { useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { ErNodeType } from '../model'
import { DiagramSvgIds, DiagramType } from '../model/Constats'
import { erDiagramToSchemcat, Morphism, SchemaObject } from '../model/SchemcatModel'
import Vector2 from '../utils/Vector2'
import { CardinalityText } from './CardinalityText'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import PannableZoomableSvg from './PannableZoomableSvg'

const objectCircleRadius = 18
const rectangleWidth = 100
const rectangleHeight = 50

interface SchemcatVisualizationDiagramProps {
  isSelectedNodeInActiveTabSet?: boolean
}

export function SchemcatVisualizationObjectView({ object }: { object: SchemaObject }) {
  const diagram = useStore((state) => state.diagram)
  const node = diagram.nodes.find((n) => n.id === object.key)
  if (!node) throw new Error('could not find node')
  const renderRectangle = node.type !== ErNodeType.AttributeType

  if (renderRectangle)
    return (
      <>
        <rect
          x={node.x - rectangleWidth / 2}
          y={node.y - rectangleHeight / 2}
          width={rectangleWidth}
          height={rectangleHeight}
          stroke='black'
          strokeWidth={1}
          fill='white'></rect>
        <text dominantBaseline='middle' textAnchor='middle' x={node.x} y={node.y} color='black'>
          {object.label}
        </text>
      </>
    )
  else
    return (
      <>
        <circle cx={node.x} cy={node.y} r={objectCircleRadius} stroke='black' strokeWidth={1} fill='white'></circle>
        <text dominantBaseline='middle' x={node.x + objectCircleRadius + 2} y={node.y} textAnchor='left' color='black'>
          {object.label}
        </text>
      </>
    )
}

export function SchemcatVisualizationMorphism({ morphism }: { morphism: Morphism }) {
  const nodes = useStore((state) => state.diagram.nodes)
  const from = nodes.find((n) => n.id === morphism.domain)
  const to = nodes.find((n) => n.id === morphism.codomain)
  if (!from || !to) throw new Error('could not find morphism domain or codomain')
  const fromPos = new Vector2(from.x, from.y)
  const toPos = new Vector2(to.x, to.y)
  const cardinalityPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.4))

  return (
    <>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke='black' strokeWidth={1}></line>
      <CardinalityText
        x={cardinalityPosition.x}
        y={cardinalityPosition.y}
        cardinality={morphism.cardinality}
        pathId={''}
      />
    </>
  )
}

export function SchemcatVisualizationDiagram({ isSelectedNodeInActiveTabSet }: SchemcatVisualizationDiagramProps) {
  const diagram = useStore((state) => state.diagram)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const schemcat = erDiagramToSchemcat(diagram)

  const svgRef = useRef(null)
  return (
    <div className='w-full h-full overflow-hidden'>
      <PannableZoomableSvg
        isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabSet}
        svgRef={svgRef}
        svgId={DiagramSvgIds[DiagramType.SchemcatVis]}>
        <defs>
          <EmptyTriangleMarker />
          <TwoSidedMarker />
        </defs>
        {schemcat.morphisms.map((m) => (
          <SchemcatVisualizationMorphism
            key={`schemcat-vis-morphism-${m.domain}-${m.codomain}-${m.direction}-${m.respectiveErConnectionId}`}
            morphism={m}
          />
        ))}
        {schemcat.objects.map((o) => (
          <SchemcatVisualizationObjectView key={`schmcat-vis-object-${o.key}`} object={o} />
        ))}
      </PannableZoomableSvg>
    </div>
  )
}
