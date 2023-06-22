// eslint-disable-next-line import/no-named-as-default
import { produce } from 'immer'
import { useLayoutEffect, useRef, useState } from 'react'
import { useStore } from '../hooks/useStore'
import { Rectangle, ErDiagramEntityType } from '../model'
import { Point } from '../model/Point'
import { clientToSvgCoordinates } from '../utils/Svg'
import { Draggable } from './Draggable'
import { shallowClone } from '../utils/Types'

interface PannableZoomableSvgProps {
  children?: React.ReactNode
  isSelectedNodeInActiveTabSet?: boolean
  onLeftClick?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
  onDragStart?: (start: Point, target: EventTarget) => boolean | void
  onDrag?: (svgPos: Point) => boolean | void
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
  svgRef?: React.MutableRefObject<SVGSVGElement | null>
  svgId?: string
}

/**
 * Checks the current viewBox and determines whether further zoom-in or zoom-out is inadvisable.
 * That is, further zoom would either be too small or too large.
 * @param currentViewBox Current view rectangle.
 * @param scaleDelta The requested scale change. >1 means zoom-in, <1 means zoom-out.
 * @returns `true` iff further zoom-in or zoom-out is inadvisable
 */
function shouldPreventZoom(currentViewBox: Rectangle, scaleDelta: number): boolean {
  const maxSize = 2500
  const minSize = 200
  return (
    ((currentViewBox.width > maxSize || currentViewBox.height > maxSize) && scaleDelta > 1) ||
    ((currentViewBox.width < minSize || currentViewBox.height < minSize) && scaleDelta < 1)
  )
}

function PannableZoomableSvg({
  children,
  isSelectedNodeInActiveTabSet: isSelectedNodeInActiveTabset = false,
  onLeftClick,
  onDragStart,
  onDrag,
  onMouseMove,
  svgRef = useRef(null),
  svgId,
}: PannableZoomableSvgProps) {
  const viewBox = useStore((state) => state.diagram.viewBox)
  const isZoomPanSynced = useStore((state) => state.isZoomPanSynced)
  const updateDiagram = useStore((state) => state.updateDiagram)
  const updateEntity = useStore((state) => state.updateErEntityByDiscriminator)
  const selectedEntities = useStore((state) => state.diagram.selectedEntities)

  const [customViewBox, setCustomViewBox] = useState<Rectangle>(shallowClone(Rectangle, viewBox))
  const [viewBoxOnDragStart, setViewBoxOnDragStart] = useState({
    x: 0,
    y: 0,
  })

  function handleDragStart(_start: Point, target: EventTarget): boolean {
    if (svgRef.current === null) return true
    const svg: SVGSVGElement = svgRef.current
    const preventDragging = onDragStart && onDragStart(_start, target)
    if (svg == target && !preventDragging) {
      setViewBoxOnDragStart({
        x: svg.viewBox.baseVal.x,
        y: svg.viewBox.baseVal.y,
      })
      return false
    }
    return true
  }
  function handleDragging(start: Point, now: Point) {
    if (svgRef.current === null) return
    const svg: SVGSVGElement = svgRef.current
    const startPoint = clientToSvgCoordinates(start.x, start.y, svg)
    const endPoint = clientToSvgCoordinates(now.x, now.y, svg)

    if (onDrag && onDrag(now)) return

    function updateViewBox(viewBox: Rectangle) {
      viewBox.x = viewBoxOnDragStart.x - (endPoint.x - startPoint.x)
      viewBox.y = viewBoxOnDragStart.y - (endPoint.y - startPoint.y)
    }

    if (isZoomPanSynced) updateDiagram((d) => updateViewBox(d.viewBox))
    else setCustomViewBox(produce(updateViewBox))
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>, svgRef: React.RefObject<SVGSVGElement>) {
    // We cannot preventDefault() here, because wheel is a passive event listener.
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    // The scrolling capability must be properly disabled in the style layer. See #13.
    const scaleFactor = 1.6
    const delta = e.deltaY || e.detail || 0
    const normalized = -(delta % 3 ? delta * 10 : delta / 3)
    const scaleDelta = normalized > 0 ? 1 / scaleFactor : scaleFactor
    if (svgRef.current === null) return
    const svg: SVGSVGElement = svgRef.current
    const p = svg.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const startPoint = p.matrixTransform(svg.getScreenCTM()?.inverse())

    function updateViewBox(viewBox: Rectangle) {
      if (shouldPreventZoom(viewBox, scaleDelta)) return
      viewBox.width *= scaleDelta
      viewBox.height *= scaleDelta
      viewBox.x -= (startPoint.x - svg.viewBox.baseVal.x) * (scaleDelta - 1)
      viewBox.y -= (startPoint.y - svg.viewBox.baseVal.y) * (scaleDelta - 1)
    }

    if (isZoomPanSynced) updateDiagram((d) => updateViewBox(d.viewBox))
    else setCustomViewBox(produce(updateViewBox))
  }

  useLayoutEffect(() => {
    if (!isZoomPanSynced) setCustomViewBox(shallowClone(Rectangle, viewBox))
    if (isZoomPanSynced && isSelectedNodeInActiveTabset) {
      // leader
      updateDiagram((d) => (d.viewBox = shallowClone(Rectangle, customViewBox)))
    }
  }, [isZoomPanSynced])

  return (
    <Draggable onDragStart={handleDragStart} onDragging={handleDragging}>
      <svg
        id={svgId}
        viewBox={
          isZoomPanSynced
            ? `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
            : `${customViewBox.x} ${customViewBox.y} ${customViewBox.width} ${customViewBox.height}`
        }
        className='h-[100vh] w-[100vw] cursor-move'
        ref={svgRef}
        // zoom on mouse wheel
        onWheel={(e) => handleWheel(e, svgRef)}
        onClick={(e) => e.target === svgRef.current && e.button === 0 && onLeftClick && onLeftClick(e)}
        onMouseMove={onMouseMove}
        preserveAspectRatio='xMidYMid meet'>
        {children}
      </svg>
    </Draggable>
  )
}

export default PannableZoomableSvg
