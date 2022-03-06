import {
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
  createContext,
  forwardRef,
  ReactNode,
  CSSProperties,
  MutableRefObject,
} from 'react'
import FocusLock from 'react-focus-lock'
import { RemoveScroll } from 'react-remove-scroll'
import { animated } from 'react-spring'
import { mergeRefs } from '../util/merge-refs'
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
    const { contentRef } = useDialogContext()
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
        <animated.div ref={mergeRefs(ref, contentRef)} {...props}>
          {children}
        </animated.div>
      </FocusLock>
    )
  },
)

export interface DialogProps extends DialogOverlayProps {}

export const Dialog = ({ children, ...props }: DialogProps) => {
  return <DialogOverlay {...props}>{children}</DialogOverlay>
}

interface DialogOverlayProps {
  id?: string
  isOpen?: boolean
  children: ReactNode
}

const DialogOverlay = ({ id, isOpen, children }: DialogOverlayProps) => {
  const contentRef = useRef<any>()
  const ctxt = useMemo(() => ({ contentRef, dialogId: id }), [id])

  if (!isOpen) return null
  return (
    <dialogContext.Provider value={ctxt}>
      <RemoveScroll
      // allowPinchZoom
      // enabled
      >
        <Portal>
          <FocusTakeoverBoundary id={id}>{children}</FocusTakeoverBoundary>
        </Portal>
      </RemoveScroll>
    </dialogContext.Provider>
  )
}

interface DialogContext {
  dialogId?: string
  contentRef: MutableRefObject<any>
}

const dialogContext = createContext<DialogContext>({
  dialogId: undefined,
  contentRef: { current: null },
})

export const useDialogContext = () => useContext(dialogContext)

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
