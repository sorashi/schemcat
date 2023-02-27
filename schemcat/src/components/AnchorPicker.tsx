import React, { useEffect, useState } from 'react'
import { Anchor } from '../model/DiagramModel'

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

export const AnchorPicker: React.FC<AnchorPickerProps> = ({
  enabled = enabledAnchorsCombinations.all,
  onChanged,
  initialAnchor = undefined,
}: AnchorPickerProps) => {
  // useState hook to store the selected anchor position
  const [anchor, setAnchor] = useState(initialAnchor)

  // create a Map that maps each anchor position to the corresponding icon name
  const anchorIcons: Map<Anchor, string> = new Map([
    [Anchor.TopLeft, '⬉'],
    [Anchor.Top, '⬆'],
    [Anchor.TopRight, '⬈'],
    [Anchor.Left, '⬅'],
    [Anchor.Center, '⊙'],
    [Anchor.Right, '➡'],
    [Anchor.BottomLeft, '⬋'],
    [Anchor.Bottom, '⬇'],
    [Anchor.BottomRight, '⬊'],
  ])

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
    <div className='grid grid-cols-3 gap-1'>
      {Object.values(Anchor).map((position) => (
        <button
          key={position}
          className={`focus:ring-2 focus:ring-blue-300 px-4 py-2 rounded-md disabled:opacity-50 ${
            anchor === position ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          onClick={() => handleAnchorSelection(position)}
          disabled={!enabled.includes(position)}>
          {anchorIcons.get(position)}
        </button>
      ))}
    </div>
  )
}
