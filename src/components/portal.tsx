import { useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForceUpdate } from '../hooks/force-update'

export const Portal = ({ noPortal = false, children }) => {
  const mountNode = useRef<any>(null)
  const portalNode = useRef<any>(null)
  const forceUpdate = useForceUpdate()

  useLayoutEffect(() => {
    if (noPortal) return
    if (!mountNode.current) return

    portalNode.current = document?.createElement('div')
    portalNode.current.dataset.portal = 'true'
    document.body.appendChild(portalNode.current)
    forceUpdate()

    return () => {
      if (portalNode.current) document.body.removeChild(portalNode.current)
    }
  }, [forceUpdate, noPortal])

  if (noPortal) return children
  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <span ref={mountNode} />
  )
}
