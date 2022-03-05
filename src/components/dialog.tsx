import {
  useEffect,
  useCallback,
  ReactNode,
  forwardRef,
  CSSProperties,
} from 'react'
import FocusLock from 'react-focus-lock'
import { animated } from 'react-spring'
import { FocusTakeoverBoundary } from './focus-takeover'
import { Portal } from './portal'

// TODO: aria attrs

export interface DialogContentProps {
  noFocusLock?: boolean
  initialFocusRef?: any
  style?: CSSProperties
  children: ReactNode
}

export const DialogContent = forwardRef(
  (
    {
      noFocusLock = false,
      initialFocusRef,
      children,
      ...props
    }: DialogContentProps,
    ref: any,
  ) => {
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
        <animated.div ref={ref} {...props}>
          {children}
        </animated.div>
      </FocusLock>
    )
  },
)

interface DialogProps extends DialogOverlayProps {}

export const Dialog = (props: DialogProps) => {
  return <DialogOverlay {...props} />
}

interface DialogOverlayProps {
  id?: string
  isOpen?: boolean
  children: ReactNode
}

const DialogOverlay = ({ id, isOpen, children }: DialogOverlayProps) => {
  if (!isOpen) return null
  return (
    <Portal>
      <FocusTakeoverBoundary id={id}>{children}</FocusTakeoverBoundary>
    </Portal>
  )
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
