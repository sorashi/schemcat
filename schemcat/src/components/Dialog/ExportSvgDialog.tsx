import { create } from 'zustand'
import { Dialog, DialogResult } from './Dialog'

interface ExportSvgDialogData {}
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
  function handleClosing(result: DialogResult) {
    if (result === DialogResult.Ok) onOk({})
    setIsVisible(false)
  }

  return (
    <Dialog visible={isVisible} onClosing={handleClosing} title='Export SVG'>
      <p>
        This is the Export SVG dialog and will contain a form for options like "include serialized diagram" and which
        diagrams to include in the SVG etc.
      </p>
    </Dialog>
  )
}
