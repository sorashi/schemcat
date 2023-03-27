import { instanceToPlain } from 'class-transformer'
import { useState } from 'react'
import { create } from 'zustand'
import { useStore } from '../../hooks/useStore'
import { Checkbox } from '../UserControls/Checkbox'
import { Radio } from '../UserControls/Radio'
import { Dialog, DialogResult } from './Dialog'

export interface ExportSvgDialogData {
  /** Whether to include a serialized version of this diagram in the exported SVG. */
  includeSerialized: boolean
}
interface ExportSvgDialogState {
  isVisible: boolean
  onOk(data: ExportSvgDialogData): void
  setIsVisible(isVisible: boolean): void
  setOnOk(onOk: (data: ExportSvgDialogData) => void): void
}

export const useExportSvgDialogState = create<ExportSvgDialogState>()((set) => ({
  isVisible: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onOk: (data) => {},
  setIsVisible: (isVisible: boolean) => set((state) => ({ ...state, isVisible: isVisible })),
  setOnOk: (onOk: (data: ExportSvgDialogData) => void) => set((state) => ({ ...state, onOk: onOk })),
}))

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExportSvgDialogProps {}

export function ExportSvgDialog(props: ExportSvgDialogProps) {
  const isVisible = useExportSvgDialogState((state) => state.isVisible)
  const onOk = useExportSvgDialogState((state) => state.onOk)
  const setIsVisible = useExportSvgDialogState((state) => state.setIsVisible)

  const [data, setData] = useState<ExportSvgDialogData>({ includeSerialized: true })

  function handleClosing(result: DialogResult) {
    if (result === DialogResult.Ok) onOk(data)
    setIsVisible(false)
  }

  return (
    <Dialog visible={isVisible} onClosing={handleClosing} title='Export SVG'>
      <form>
        <Radio
          name='export-svg-diagram-choice'
          className='w-full border border-gray-400 p-1 mb-1 rounded'
          options={['ER Diagram', 'Schemcat Diagram', 'Schemcat Visualization Diagram']}
          defaultValue='ER Diagram'
        />
        <Checkbox
          label='Include serialized diagram'
          hoverHint='This makes the SVG file larger, but allows it to be opened and edited later.'
          value={data.includeSerialized}
          onChange={() => setData({ ...data, includeSerialized: !data.includeSerialized })}
        />
      </form>
    </Dialog>
  )
}
