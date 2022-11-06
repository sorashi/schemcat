import { useEffect } from "react"
import { KeyShortcut } from "../model/MenuModel"

export function useKeyboardShortcut(
    shortcut: KeyShortcut,
    callback: (e: KeyboardEvent) => void,
    deps: any[] = []
) {
    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if (e.key.toLowerCase() === shortcut.key &&
                e.ctrlKey === shortcut.ctrlKey &&
                e.shiftKey === shortcut.shiftKey &&
                e.altKey === shortcut.altKey &&
                e.metaKey === shortcut.metaKey)
                callback(e)
        }
        window.addEventListener("keydown", handleKeydown)
        return () => window.removeEventListener("keydown", handleKeydown)
    }, [shortcut, callback, deps])
}