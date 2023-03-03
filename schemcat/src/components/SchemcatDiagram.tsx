import { useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { erDiagramToSchemcat } from '../model/SchemcatModel'
import EmptyTriangleMarker from './EmptyTriangleMarker'
import PannableZoomableSvg from './PannableZoomableSvg'

interface SchemcatDiagramProps {
  isSelectedNodeInActiveTabSet?: boolean
}

function SchemcatDiagram({ isSelectedNodeInActiveTabSet }: SchemcatDiagramProps) {
  const diagram = useStore((state) => state.diagram)
  const updateDiagram = useStore((state) => state.updateDiagram)

  const svgRef = useRef(null)
  const schemcat = erDiagramToSchemcat(diagram)
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
        </defs>
      </PannableZoomableSvg>
    </div>
  )
}

export default SchemcatDiagram
