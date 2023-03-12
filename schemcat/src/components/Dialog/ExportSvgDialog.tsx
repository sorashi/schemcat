import { instanceToPlain } from 'class-transformer'
import { useState } from 'react'
import { create } from 'zustand'
import { useStore } from '../../hooks/useStore'
import { Checkbox } from '../UserControls/Checkbox'
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
  onOk: (data) => {},
  setIsVisible: (isVisible: boolean) => set((state) => ({ ...state, isVisible: isVisible })),
  setOnOk: (onOk: (data: ExportSvgDialogData) => void) => set((state) => ({ ...state, onOk: onOk })),
}))

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
        <Checkbox
          label='Include serialized diagram'
          value={data.includeSerialized}
          onChange={() => setData({ ...data, includeSerialized: !data.includeSerialized })}
        />
      </form>
    </Dialog>
  )
}
