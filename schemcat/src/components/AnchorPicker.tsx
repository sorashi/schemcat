import React, { useEffect, useState } from 'react'
import { Anchor } from '../model/DiagramModel'
import feather from 'feather-icons'

interface AnchorPickerProps {
  onChanged?: (anchor: Anchor) => void
  enabled?: Anchor[]
  initialAnchor?: Anchor
}

export const enabledAnchorsCombinations = {
  all: Object.values(Anchor),
  allExceptCenter: Object.values(Anchor).filter((a) => a !== Anchor.Center),
  diagonal: [Anchor.TopLeft, Anchor.TopRight, Anchor.BottomLeft, Anchor.BottomRight],
  cardinal: [Anchor.Top, Anchor.Left, Anchor.Right, Anchor.Bottom],
}

/** A Map that maps each anchor position to the corresponding icon name */
const anchorIcons: Map<Anchor, feather.FeatherIconNames> = new Map([
  [Anchor.TopLeft, 'arrow-up-left'],
  [Anchor.Top, 'arrow-up'],
  [Anchor.TopRight, 'arrow-up-right'],
  [Anchor.Left, 'arrow-left'],
  [Anchor.Center, 'circle'],
  [Anchor.Right, 'arrow-right'],
  [Anchor.BottomLeft, 'arrow-down-left'],
  [Anchor.Bottom, 'arrow-down'],
  [Anchor.BottomRight, 'arrow-down-right'],
])
export const AnchorPicker: React.FC<AnchorPickerProps> = ({
  enabled = enabledAnchorsCombinations.all,
  onChanged,
  initialAnchor = undefined,
}: AnchorPickerProps) => {
  // useState hook to store the selected anchor position
  const [anchor, setAnchor] = useState(initialAnchor)

  useEffect(() => {
    if (!anchor) return
    if (enabled.includes(anchor)) return
    console.error("Allowed anchors don't include the set anchor", enabled, anchor)
  }, [enabled, anchor])

  const handleAnchorSelection = (position: Anchor) => {
    setAnchor(position)
    if (onChanged) onChanged(position)
  }

  return (
    <div className='grid grid-cols-3 gap-1 max-w-[6.5em] min-w-[6.5em]'>
      {Object.values(Anchor).map((position) => (
        <button
          key={position}
          className={`focus:ring-2 focus:ring-blue-300 p-1  w-[2em] h-[2em] rounded-md disabled:opacity-50 ${
            anchor === position ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onClick={() => handleAnchorSelection(position)}
          disabled={!enabled.includes(position)}>
          <div
            className='flex justify-center'
            dangerouslySetInnerHTML={{
              __html: feather.icons[anchorIcons.get(position) || 'alert-circle'].toSvg({ width: '1em', height: '1em' }),
            }}></div>
        </button>
      ))}
    </div>
  )
}
