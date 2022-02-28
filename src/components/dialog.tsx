import { useEffect, useCallback, ReactNode } from 'react'
import FocusLock from 'react-focus-lock'
import { Portal } from './portal'

// TODO: aria attrs

interface DialogContentProps {
  noFocusLock?: boolean
  initialFocusRef?: any
  children: ReactNode
}

export const DialogContent = ({
  noFocusLock = false,
  initialFocusRef,
  children,
}: DialogContentProps) => {
  const activateFocusLock = useCallback(() => {
    if (initialFocusRef?.current) initialFocusRef.current.focus?.()
  }, [initialFocusRef])

  useEffect(() => {
    return createAriaHider()
  }, [])

  return (
    <FocusLock
      autoFocus
      returnFocus
      onActivation={activateFocusLock}
      disabled={noFocusLock}
    >
      {children}
    </FocusLock>
  )
}

interface DialogProps extends DialogOverlayProps {}

export const Dialog = (props: DialogProps) => {
  return <DialogOverlay {...props} />
}

interface DialogOverlayProps {
  isOpen?: boolean
  children: ReactNode
}

const DialogOverlay = ({ isOpen, children }: DialogOverlayProps) => {
  if (!isOpen) return null
  return <Portal>{children}</Portal>
}

const createAriaHider = () => {
  const originalValues: any[] = []
  const rootNodes: HTMLElement[] = []

  Array.prototype.forEach.call(
    document.querySelectorAll('body > *'),
    (node) => {
      if (node.dataset.portal) return
      const attr = node.getAttribute('aria-hidden')
      const alreadyHidden = attr !== null && attr !== 'false'
      if (alreadyHidden) return
      originalValues.push(attr)
      rootNodes.push(node)
      node.setAttribute('aria-hidden', 'true')
    },
  )

  return () => {
    rootNodes.forEach((node, index) => {
      const originalValue = originalValues[index]
      if (originalValue === null) {
        node.removeAttribute('aria-hidden')
      } else {
        node.setAttribute('aria-hidden', originalValue)
      }
    })
  }
}
