import React, { useMemo, useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { erDiagramToSchemcat } from '../model/SchemcatModel'
import Vector2 from '../utils/Vector2'
import { CardinalityText } from './CardinalityText'
import { DiagramType, DiagramSvgIds } from '../model/Constats'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import { twoSidedMarkerId } from './Markers/TwoSidedMarker'
import PannableZoomableSvg from './PannableZoomableSvg'
import { PositionedSvgGroup } from './PositionedSvgGroup'
import { selectedStrokeStyle } from '../Constants'
import { groupBy } from '../utils/Array'
import { Angle } from '../utils/Angle'
import SvgPathStringBuilder from '../utils/SvgPathStringBuilder'

interface SchemcatDiagramProps {
  isSelectedNodeInActiveTabSet?: boolean
}

const objectCircleRadius = 18

function SchemcatDiagram({ isSelectedNodeInActiveTabSet }: SchemcatDiagramProps) {
  const diagram = useStore((state) => state.diagram)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const setSelectedSchemcatEntity = useStore((state) => state.setSelectedSchemcatEntity)
  const selectedSchemcatEntity = useStore((state) => state.selectedSchemcatEntity)

  const svgRef = useRef(null)
  const schemcat = useMemo(() => erDiagramToSchemcat(diagram), [diagram])
  const morphismGroups = groupBy(schemcat.morphisms, (m) => m.signature[0])
  const nodes = diagram.nodes
  return (
    <div
      className='w-full h-full overflow-hidden'
      // ref={dropRef}
    >
      {/* {nodeContextMenuState.show && (
        <NodeContextMenu
          location={nodeContextMenuState.location}
          nodeId={nodeContextMenuState.nodeId}
          onAfterAction={() => setNodeContextMenuState({ ...nodeContextMenuState, show: false })}></NodeContextMenu>
      )} */}
      <PannableZoomableSvg
        isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabSet}
        // onDragStart={() => setNodeContextMenuState({ ...nodeContextMenuState, show: false })}
        onLeftClick={(e) => {
          updateDiagram((d) => (d.selectedEntities = []))
          setSelectedSchemcatEntity()
        }}
        svgRef={svgRef}
        svgId={DiagramSvgIds[DiagramType.Schemcat]}>
        <defs>
          <EmptyTriangleMarker />
          <TwoSidedMarker />
        </defs>
        {[...morphismGroups.entries()].map((mgroup) => {
          const m = mgroup[1][0]
          const dual = mgroup[1][1]
          const from = nodes.find((n) => n.id === m.domain)
          const to = nodes.find((n) => n.id === m.codomain)
          if (!from || !to) return null
          const fromVector = new Vector2(from.x, from.y)
          const toVector = new Vector2(to.x, to.y)
          const cardinalityPosition = fromVector.add(toVector.subtract(fromVector).multiply(0.3))
          const signaturePosition = fromVector.add(toVector.subtract(fromVector).multiply(0.5))
          const backCardinalityPosition = fromVector.add(toVector.subtract(fromVector).multiply(0.7))

          const similarMorphisms = schemcat.morphisms.filter((x) => x.domain == m.domain && x.codomain == m.codomain)
          const thisMorphismIndex = similarMorphisms.findIndex((x) => x.signature[0] == m.signature[0])
          const directionVector = toVector.subtract(fromVector)
          const perpDir = directionVector.rotate(Angle.rightAngle).normalize()
          const perpLineLength = 100
          const perpLineFrom = fromVector.add(
            directionVector.multiply(0.5).subtract(perpDir.multiply(perpLineLength / 2))
          )
          const perpLineTo = fromVector.add(directionVector.multiply(0.5).add(perpDir.multiply(perpLineLength / 2)))
          const perpLineVector = perpLineTo.subtract(perpLineFrom)
          const curvePoint = perpLineFrom.add(
            perpLineVector.multiply((1 / similarMorphisms.length) * thisMorphismIndex)
          )
          const pathSb = new SvgPathStringBuilder()
          pathSb.start(fromVector)
          pathSb.quadraticBezier(curvePoint, toVector)
          const onClick = () => setSelectedSchemcatEntity({ type: 'Morphism', id: m.signature[0] })
          const cardinalityPositionCoefficient = 0.5
          const curveCardinalityPosition = fromVector.add(
            curvePoint.subtract(fromVector).multiply(cardinalityPositionCoefficient)
          )
          const curveBackCardinalityPosition = toVector.add(
            curvePoint.subtract(toVector).multiply(cardinalityPositionCoefficient)
          )

          return (
            <React.Fragment
              key={`raw-schemcat-morphism-${m.domain}-${m.codomain}-${m.signature.join('.')}-${
                m.respectiveErConnectionId
              }`}>
              {similarMorphisms.length > 1 ? (
                <>
                  <path
                    d={pathSb.toString()}
                    stroke='black'
                    fill='none'
                    strokeWidth={1}
                    style={selectedSchemcatEntity?.id == m.signature[0] ? selectedStrokeStyle : undefined}></path>
                  <path
                    d={pathSb.toString()}
                    stroke='rgba(255,0,0,0)'
                    fill='none'
                    strokeWidth={5}
                    onClick={onClick}></path>
                  <CardinalityText
                    x={curveCardinalityPosition.x}
                    y={curveCardinalityPosition.y}
                    cardinality={m.cardinality}
                    pathId={''}
                  />
                  <text
                    x={curvePoint.x + 5}
                    y={curvePoint.y}
                    dominantBaseline='middle'
                    alignmentBaseline='middle'
                    textAnchor='start'>
                    {mgroup[0]}
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
                    stroke='rgba(50,50,50,1)'
                    strokeWidth={1}
                    style={selectedSchemcatEntity?.id == m.signature[0] ? selectedStrokeStyle : undefined}></line>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke='rgba(200,0,0,0)'
                    strokeWidth={10}
                    onClick={onClick}></line>
                  <CardinalityText
                    x={cardinalityPosition.x}
                    y={cardinalityPosition.y}
                    cardinality={m.cardinality}
                    pathId={''}
                  />
                  <text
                    x={signaturePosition.x + 5}
                    y={signaturePosition.y}
                    dominantBaseline='middle'
                    alignmentBaseline='middle'
                    textAnchor='start'>
                    {mgroup[0]}
                  </text>
                  <CardinalityText
                    x={backCardinalityPosition.x}
                    y={backCardinalityPosition.y}
                    cardinality={dual.cardinality}
                    pathId={''}
                  />
                </>
              )}
            </React.Fragment>
          )
        })}
        {schemcat.objects.map((o) => {
          const node = nodes.find((x) => x.id === o.key)
          if (!node) return null
          return (
            <PositionedSvgGroup x={node.x} y={node.y} key={`raw-schemcat-object-${o.key}`}>
              <circle
                cx={0}
                cy={0}
                r={objectCircleRadius}
                stroke='black'
                strokeWidth={1}
                fill='white'
                onClick={(e) => setSelectedSchemcatEntity({ type: 'Object', id: o.key })}
                style={selectedSchemcatEntity?.id == o.key ? selectedStrokeStyle : undefined}></circle>
              <text dominantBaseline='middle' x={objectCircleRadius + 2} y={0} textAnchor='left' color='black'>
                {o.label}
              </text>
            </PositionedSvgGroup>
          )
        })}
      </PannableZoomableSvg>
    </div>
  )
}

export default SchemcatDiagram
