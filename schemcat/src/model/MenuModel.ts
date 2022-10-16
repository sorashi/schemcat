import React from "react"

export interface ICommand {
    execute(): void
}

export class NewFileCommand implements ICommand {
    execute(): void {
        throw new Error("Method not implemented.")
    }
}
export class UndoFileCommand implements ICommand {
    execute(): void {
        throw new Error("Method not implemented.")
    }
}
export class RedoFileCommand implements ICommand {
    execute(): void {
        throw new Error("Method not implemented.")
    }
}

export interface KeyShortcut {
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    shiftKey: boolean,
    key: string
}
const defaultKeyShortcut: KeyShortcut = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    key: ""
}

export interface MenuItem {
    title: string,
    command?: ICommand,
    keyShortcut?: KeyShortcut,
    submenu?: MenuItem[],
}
type MenuModel = MenuItem[]
enum Modifier {
    Alt = "alt",
    Ctrl = "ctrl",
    Meta = "meta",
    Shift = "shift"
}

function getShortcut(mods: Modifier[], key: string): KeyShortcut {
    const shortcut = { ...defaultKeyShortcut }
    shortcut.key = key.toLowerCase()
    mods.forEach(mod => {
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
            throw new RangeError("Invalid modifier")
        }
    })
    return shortcut
}
export function shortcutToString(shortcut: KeyShortcut): string {
    const mods = []
    if (shortcut.ctrlKey) mods.push("Ctrl")
    if (shortcut.altKey) mods.push("Alt")
    if (shortcut.metaKey) mods.push("Meta")
    if (shortcut.shiftKey) mods.push("Shift")
    return mods.join("+") + (mods.length > 0 ? "+" : "") + shortcut.key.toUpperCase()
}

export const menuModel: MenuModel = [
    {
        title: "File",
        submenu: [
            {
                title: "New",
                command: new NewFileCommand(),
            },
            {
                title: "Export",
                submenu: [
                    {
                        title: "Export as SVG"
                    },
                    {
                        title: "Export as PNG"
                    },
                ]
            },
        ]
    },
    {
        title: "Edit",
        submenu: [
            {
                title: "Undo",
                keyShortcut: getShortcut([Modifier.Ctrl], "z"),
                command: new UndoFileCommand(),
            },
            {
                title: "Redo",
                keyShortcut: getShortcut([Modifier.Ctrl], "y"),
                command: new RedoFileCommand(),
            }
        ]
    }
]
