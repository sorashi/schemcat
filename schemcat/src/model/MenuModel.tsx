import { DropdownItem, DropdownItemProps } from '../components/Menu/DropdownItem'
import { ExportSvgMenuItem } from '../components/Menu/ExportSvgMenuItem'
import { LoadFileMenuItem } from '../components/Menu/LoadFileMenuItem'
import { RedoMenuItem } from '../components/Menu/RedoMenuItem'
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
        factory: (props: DropdownItemProps) => <DropdownItem {...props} canDoAction={() => false} />,
      },
      {
        title: 'Load from file',
        factory: (props: DropdownItemProps) => <LoadFileMenuItem {...props} />,
      },
      {
        title: 'Export',
        submenu: [
          {
            title: 'Export as SVG',
            factory: (props: DropdownItemProps) => <ExportSvgMenuItem {...props} />,
          },
          {
            title: 'Export as PNG',
            factory: (props: DropdownItemProps) => <DropdownItem {...props} canDoAction={() => false} />,
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
    ],
  },
]
