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
          const fromPos = new Vector2(from.x, from.y)
          const toPos = new Vector2(to.x, to.y)
          const cardinalityPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.3))
          const signaturePosition = fromPos.add(toPos.subtract(fromPos).multiply(0.5))
          const backCardinalityPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.7))
          return (
            <React.Fragment
              key={`raw-schemcat-morphism-${m.domain}-${m.codomain}-${m.signature.join('.')}-${
                m.respectiveErConnectionId
              }`}>
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
                onClick={(e) => setSelectedSchemcatEntity({ type: 'Morphism', id: m.signature[0] })}></line>
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
