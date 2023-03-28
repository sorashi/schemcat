import { menuModel } from '../../model/MenuModel'
import { v4 as uuidv4 } from 'uuid'
import { MenuItem } from './MenuItem'
import { ToggleButton } from '../ToggleButton'
import { useStore } from '../../hooks/useStore'
import { EditableText } from '../UserControls/EditableText'

export function MenuBar() {
  const setIsZoomPanLocked = useStore((state) => state.setIsZoomPanSynced)
  const setProjectName = useStore((state) => state.setProjectName)
  const projectName = useStore((state) => state.projectName)
  return (
    <ul className='flex flex-row flex-wrap items-center gap-1 py-1 px-2 my-0 mx-auto'>
      {menuModel.map((item) => (
        <MenuItem key={uuidv4()} item={item} />
      ))}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.clear()
            location.reload()
          }}
          className='border border-orange-400 bg-orange-100 p-1 hover:bg-orange-300 active:bg-orange-500 text-xs'>
          RESET
        </button>
      )}
      <ToggleButton className='ml-5' label='Sync Pan & Zoom' onToggle={(locked) => setIsZoomPanLocked(locked)} />
      <EditableText initialText={projectName} onChange={(e) => setProjectName(e.target.value)} />
    </ul>
  )
}
