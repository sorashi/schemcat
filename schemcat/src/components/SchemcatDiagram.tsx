import React, { useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { erDiagramToSchemcat } from '../model/SchemcatModel'
import Vector2 from '../utils/Vector2'
import { CardinalityText } from './CardinalityText'
import { EmptyTriangleMarker, TwoSidedMarker } from './Markers'
import { twoSidedMarkerId } from './Markers/TwoSidedMarker'
import PannableZoomableSvg from './PannableZoomableSvg'

interface SchemcatDiagramProps {
  isSelectedNodeInActiveTabSet?: boolean
}

function SchemcatDiagram({ isSelectedNodeInActiveTabSet }: SchemcatDiagramProps) {
  const diagram = useStore((state) => state.diagram)
  const updateDiagram = useStore((state) => state.updateDiagram)

  const svgRef = useRef(null)
  const schemcat = erDiagramToSchemcat(diagram)
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
        }}
        svgRef={svgRef}>
        <defs>
          <EmptyTriangleMarker />
          <TwoSidedMarker />
        </defs>
        {schemcat.objects.map((o) => {
          const node = nodes.find((x) => x.id === o.key)
          if (!node) return null
          return (
            <React.Fragment key={`raw-schemcat-object-${o.key}`}>
              <circle cx={node.x} cy={node.y} r={7} stroke='black' strokeWidth={1} fill='white'></circle>
              <text x={node.x + 7} y={node.y + 4}>
                {o.label}
              </text>
            </React.Fragment>
          )
        })}
        {schemcat.morphisms.map((m) => {
          const from = nodes.find((n) => n.id === m.domain)
          const to = nodes.find((n) => n.id === m.codomain)
          if (!from || !to) return null
          const fromPos = new Vector2(from.x, from.y)
          const toPos = new Vector2(to.x, to.y)
          const cardinalityPosition = fromPos.add(toPos.subtract(fromPos).multiply(0.5))
          return (
            <React.Fragment key={`raw-schemcat-morphism-${m.domain}-${m.codomain}-${m.direction}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                markerEnd={`url(#${twoSidedMarkerId})`}
                stroke='rgba(50,50,50,0.5)'
                strokeWidth={1}></line>
              <CardinalityText
                x={cardinalityPosition.x}
                y={cardinalityPosition.y}
                cardinality={m.cardinality}
                pathId={''}
              />
            </React.Fragment>
          )
        })}
      </PannableZoomableSvg>
    </div>
  )
}

export default SchemcatDiagram
