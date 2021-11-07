import { useRef, useEffect } from 'react'

const createRootEl = (id: string) => {
  const el = document.createElement('div')
  el.setAttribute('id', id)
  return el
}

const mountPortalEl = (el) => {
  const portalEl = document.getElementById('portal')
  if (!portalEl) return

  portalEl.appendChild(el)
  // portalEl.insertBefore(el, (portalEl.lastElementChild || portalEl).nextElementSibling)
}

const usePortal = (id: string) => {
  const rootElemRef = useRef<any>(null),
    getRootElem = () => {
      if (!rootElemRef.current)
        rootElemRef.current = document.createElement('div')
      return rootElemRef.current
    }

  useEffect(() => {
    const existingParent = document.getElementById(id),
      parentElem = existingParent || createRootEl(id)

    if (!existingParent) {
      mountPortalEl(parentElem)
    }

    parentElem.appendChild(rootElemRef.current)

    return () => {
      rootElemRef.current.remove()
      if (!parentElem.childElementCount) parentElem.remove()
    }
  }, [id])

  return getRootElem()
}

export default usePortal
