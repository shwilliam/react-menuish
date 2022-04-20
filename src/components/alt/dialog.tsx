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
} from 'react'
import FocusLock from 'react-focus-lock'
import useOnClickOutside from 'use-onclickoutside'
import { RemoveScroll } from 'react-remove-scroll'
import { animated } from 'react-spring'
import {
  FocusTakeoverBoundary,
  useFocusTakeoverContext,
} from '../focus-takeover'
import { Portal } from '../portal'
import { useId } from '../../hooks/id'
import { mergeRefs } from '../../util/merge-refs'

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
    const innerRef = useRef<any>()
    const { dialogId, onClose } = useDialogContext()
    const stableContentRef = useMemo(
      () => mergeRefs(ref, innerRef),
      [ref, innerRef],
    )
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const activateFocusLock = useCallback(() => {
      if (initialFocusRef?.current) initialFocusRef.current.focus?.()
    }, [initialFocusRef])

    useOnClickOutside(innerRef, () => {
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
        <animated.div ref={stableContentRef} {...props}>
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
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
}

const DialogOverlay = ({
  id,
  isOpen,
  onClose,
  allowPinchZoom = false,
  isScrollDisabled = true,
  children,
}: DialogOverlayProps) => {
  const dialogId = useId(id)
  const ctxt = useMemo(() => ({ dialogId, onClose }), [dialogId, onClose])

  if (!isOpen) return null
  return (
    <dialogContext.Provider value={ctxt}>
      <Portal>
        <RemoveScroll
          allowPinchZoom={allowPinchZoom}
          enabled={isScrollDisabled}
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
  onClose?: () => void
}

const dialogContext = createContext<DialogContext>({
  dialogId: '',
})

export const useDialogContext = () => useContext(dialogContext)

const createAriaHider = () => {
  const prevAriaHiddenVals: any[] = []
  const nodes: HTMLElement[] = []

  Array.prototype.forEach.call(
    document.querySelectorAll('body > *'),
    (node) => {
      if (node.dataset.portal) return

      const attr = node.getAttribute('aria-hidden')
      const previouslyHidden = attr !== null && attr !== 'false'

      if (previouslyHidden) return
      prevAriaHiddenVals.push(attr)
      nodes.push(node)
      node.setAttribute('aria-hidden', 'true')
    },
  )

  return () => {
    nodes.forEach((node, index) => {
      const prevAriaHiddenVal = prevAriaHiddenVals[index]
      if (prevAriaHiddenVal === null) node.removeAttribute('aria-hidden')
      else node.setAttribute('aria-hidden', prevAriaHiddenVal)
    })
  }
}
