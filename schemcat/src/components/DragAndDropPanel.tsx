import ErNode from './ErNode'
import { ErNode as ErNodeModel, ErNodeType } from '../model/DiagramModel'
import { useDrag } from 'react-dnd'
import { useMemo } from 'react'

interface DragAndDropPanelItemProps {
  erNodeType: ErNodeType
}

function DragAndDropPanelItem({ erNodeType }: DragAndDropPanelItemProps) {
  const erNode = useMemo(() => JSON.parse(JSON.stringify(new ErNodeModel(erNodeType, erNodeType, 0, 0))), [erNodeType])
  const [{ opacity }, dragRef] = useDrag(() => {
    return {
      type: 's',
      item: { erNodeType },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      options: {
        dropEffect: 'copy', // cursor style
      },
    }
  }, [])
  return (
    <div ref={dragRef} className='w-auto h-auto' style={{ opacity }}>
      <svg className='border border-gray-400 rounded-lg w-40 h-20' viewBox='0 0 100 100'>
        <ErNode node={erNode} selected={false}></ErNode>
      </svg>
      <p className='text-center text-sm text-gray-400 font-sans'>{erNodeType}</p>
    </div>
  )
}

function DragAndDropPanel() {
  return (
    <div className='flex flex-row flex-wrap gap-2 p-5'>
      <DragAndDropPanelItem erNodeType={ErNodeType.EntityType}></DragAndDropPanelItem>
      <DragAndDropPanelItem erNodeType={ErNodeType.RelationshipType}></DragAndDropPanelItem>
      <DragAndDropPanelItem erNodeType={ErNodeType.AttributeType}></DragAndDropPanelItem>
    </div>
  )
}

export default DragAndDropPanel
