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
import useOnClickOutside from 'use-onclickoutside'
import { RemoveScroll } from 'react-remove-scroll'
import { animated } from 'react-spring'
import { useId } from '@react-aria/utils'
import { mergeRefs } from '../util/merge-refs'
import {
  FocusTakeoverBoundary,
  useFocusTakeoverContext,
} from './focus-takeover'
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
    const { dialogId, contentRef, onClose } = useDialogContext()
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const activateFocusLock = useCallback(() => {
      if (initialFocusRef?.current) initialFocusRef.current.focus?.()
    }, [initialFocusRef])

    useOnClickOutside(contentRef, () => {
      if (isActiveFocusBoundary(dialogId)) onClose?.()
    })

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
  onClose?: () => void
  children: ReactNode
}

const DialogOverlay = ({
  id,
  isOpen,
  onClose,
  children,
}: DialogOverlayProps) => {
  const dialogId = useId(id)
  const contentRef = useRef<any>()
  const ctxt = useMemo(
    () => ({ contentRef, dialogId, onClose }),
    [dialogId, onClose],
  )

  if (!isOpen) return null
  return (
    <dialogContext.Provider value={ctxt}>
      <Portal>
        <RemoveScroll
        // allowPinchZoom
        // enabled
        >
          <FocusTakeoverBoundary id={dialogId}>
            {children}
          </FocusTakeoverBoundary>
        </RemoveScroll>
      </Portal>
    </dialogContext.Provider>
  )
}

interface DialogContext {
  dialogId: string
  contentRef: MutableRefObject<any>
  onClose?: () => void
}

const dialogContext = createContext<DialogContext>({
  dialogId: '',
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
