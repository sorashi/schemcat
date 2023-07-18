import { ClearAllDataMenuItem } from '../components/Menu/ClearAllDataMenuItem'
import { DropdownItem, DropdownItemProps } from '../components/Menu/DropdownItem'
import { ExportJsonMenuItem } from '../components/Menu/ExportJsonMenuItem'
import { ExportPngMenuItem } from '../components/Menu/ExportPngMenuItem'
import { ExportSvgMenuItem } from '../components/Menu/ExportSvgMenuItem'
import { LoadFileMenuItem } from '../components/Menu/LoadFileMenuItem'
import { NewMenuItem } from '../components/Menu/NewMenuItem'
import { RedoMenuItem } from '../components/Menu/RedoMenuItem'
import { ResetLayoutMenuItem } from '../components/Menu/ResetLayoutMenuItem'
import { UndoMenuItem } from '../components/Menu/UndoMenuItem'

export interface KeyShortcut {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  key: string
}
const defaultKeyShortcut: KeyShortcut = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  key: '',
}

export interface MenuItem {
  title: string
  factory?: (props: DropdownItemProps) => JSX.Element
  keyShortcut?: KeyShortcut
  submenu?: MenuItem[]
}

type MenuModel = MenuItem[]
export enum Modifier {
  Alt = 'alt',
  Ctrl = 'ctrl',
  Meta = 'meta',
  Shift = 'shift',
}

export function getShortcut(mods: Modifier[], key: string): KeyShortcut {
  const shortcut = { ...defaultKeyShortcut }
  shortcut.key = key.toLowerCase()
  mods.forEach((mod) => {
    switch (mod) {
      case Modifier.Alt:
        shortcut.altKey = true
        break
      case Modifier.Ctrl:
        shortcut.ctrlKey = true
        break
      case Modifier.Meta:
        shortcut.metaKey = true
        break
      case Modifier.Shift:
        shortcut.shiftKey = true
        break
      default:
        throw new RangeError('Invalid modifier')
    }
  })
  return shortcut
}
export function shortcutToString(shortcut: KeyShortcut): string {
  const mods = []
  if (shortcut.ctrlKey) mods.push('Ctrl')
  if (shortcut.altKey) mods.push('Alt')
  if (shortcut.metaKey) mods.push('Meta')
  if (shortcut.shiftKey) mods.push('Shift')
  return mods.join('+') + (mods.length > 0 ? '+' : '') + shortcut.key.toUpperCase()
}

export const menuModel: MenuModel = [
  {
    title: 'File',
    submenu: [
      {
        title: 'New',
        factory: (props: DropdownItemProps) => <NewMenuItem {...props} />,
      },
      {
        title: 'Load from file',
        factory: (props: DropdownItemProps) => <LoadFileMenuItem {...props} />,
      },
      {
        title: 'Export as',
        submenu: [
          {
            title: 'SVG',
            factory: (props: DropdownItemProps) => <ExportSvgMenuItem {...props} />,
          },
          {
            title: 'PNG',
            factory: (props: DropdownItemProps) => <ExportPngMenuItem {...props} />,
          },
          {
            title: 'JSON',
            factory: (props: DropdownItemProps) => <ExportJsonMenuItem {...props} />,
          },
        ],
      },
    ],
  },
  {
    title: 'Edit',
    submenu: [
      {
        title: 'Undo',
        keyShortcut: getShortcut([Modifier.Ctrl], 'z'),
        factory: (props: DropdownItemProps) => <UndoMenuItem {...props} />,
      },
      {
        title: 'Redo',
        keyShortcut: getShortcut([Modifier.Ctrl], 'y'),
        factory: (props: DropdownItemProps) => <RedoMenuItem {...props} />,
      },
      {
        title: 'Reset Layout',
        factory: (props: DropdownItemProps) => <ResetLayoutMenuItem {...props} />,
      },
      { title: 'Clear All Data', factory: (props: DropdownItemProps) => <ClearAllDataMenuItem {...props} /> },
    ],
  },
]
