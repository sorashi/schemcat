import React, { useState } from 'react'

// define an enum for the anchor positions
enum Anchor {
  TopLeft = 'top-left',
  Top = 'top',
  TopRight = 'top-right',
  Left = 'left',
  Center = 'center',
  Right = 'right',
  BottomLeft = 'bottom-left',
  Bottom = 'bottom',
  BottomRight = 'bottom-right',
}

interface AnchorPickerProps {
  onChanged?: (anchor: Anchor) => void
  disableCenter?: boolean
  initialAnchor?: Anchor
}

export const AnchorPicker: React.FC<AnchorPickerProps> = ({
  disableCenter = false,
  onChanged,
  initialAnchor = Anchor.TopLeft,
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
          disabled={disableCenter && position === Anchor.Center}>
          {anchorIcons.get(position)}
        </button>
      ))}
    </div>
  )
}
