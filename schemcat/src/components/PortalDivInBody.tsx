import { useLayoutEffect, useState } from 'react'
import * as ReactDOM from 'react-dom'

interface PortalDivInBody {
  children?: React.ReactNode
}

/**
 * Creates a ReactDOM portal to a new `div` placed inside the `body` tag.
 * Children of this component are placed inside the portal, hence inside the `div` tag.
 */
export function PortalDivInBody(props: PortalDivInBody) {
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const div = document.createElement('div')
    document.body.prepend(div)
    setPortalRoot(div)
    return () => {
      setPortalRoot(null)
      div.remove()
    }
  }, [])
  if (portalRoot === null) return <></>
  return ReactDOM.createPortal(props.children, portalRoot)
}
