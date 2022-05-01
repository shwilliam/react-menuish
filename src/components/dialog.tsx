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
  Fragment,
  ComponentPropsWithoutRef,
} from 'react'
import _ from 'lodash'
import FocusLock from 'react-focus-lock'
import useOnClickOutside from 'use-onclickoutside'
import { RemoveScroll } from 'react-remove-scroll'
import { animated } from 'react-spring'
import {
  FocusTakeoverBoundary,
  useFocusTakeoverContext,
} from './focus-takeover'
import { Portal } from './portal'
import { Overlay } from './overlay'
import { useId } from '../hooks/id'
import { mergeRefs } from '../util/merge-refs'

// require either aria-label or aria-labelledby to be provided

export interface DialogContentProps extends ComponentPropsWithoutRef<'div'> {
  noFocusLock?: boolean
  isolateDialog?: boolean
  closeOnInteractOutside?: boolean
  initialFocusRef?: any
  style?: CSSProperties
  children: ReactNode // expected to have focusable child
}

export const DialogContent = forwardRef(
  (
    {
      noFocusLock = false,
      isolateDialog = true,
      closeOnInteractOutside = true,
      initialFocusRef,
      children,
      ...props
    }: DialogContentProps,
    ref: any,
  ) => {
    const innerRef = useRef<any>()
    const wrapperRef = useRef<any>()
    const { dialogId, onClose, overlay } = useDialogContext()
    const stableContentRef = useMemo(
      () => mergeRefs(ref, innerRef),
      [ref, innerRef],
    )
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const activateFocusLock = useCallback(() => {
      if (initialFocusRef?.current) initialFocusRef.current.focus?.()
    }, [initialFocusRef])
    const isModal = !noFocusLock && isolateDialog

    useOnClickOutside(innerRef, () => {
      if (closeOnInteractOutside && isActiveFocusBoundary(dialogId)) onClose?.()
    })

    useEffect(() => {
      if (!isolateDialog) return
      return wrapperRef.current
        ? createAriaHider(
            wrapperRef.current,
            overlay ? 2 : 1, // number of wrappers between wrapper el and portal
          )
        : () => {}
    }, [overlay, isolateDialog])

    return (
      <FocusLock
        ref={wrapperRef}
        disabled={noFocusLock}
        onActivation={activateFocusLock}
        returnFocus
        autoFocus
      >
        <animated.div
          ref={stableContentRef}
          {...(isModal ? { 'aria-modal': true, role: 'dialog' } : {})}
          {...props}
        >
          {children}
        </animated.div>
      </FocusLock>
    )
  },
)

export interface DialogProps {
  id?: string
  isOpen?: boolean
  onClose?: () => void
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
  isFocusTakeoverDisabled?: boolean
  overlay?: boolean
  children: ReactNode
}

export const Dialog = ({
  id,
  isOpen = false,
  onClose,
  allowPinchZoom = false,
  isScrollDisabled = true,
  isFocusTakeoverDisabled = false,
  overlay = false,
  children,
}: DialogProps) => {
  const dialogId = useId(id)
  const ctxt = useMemo(
    () => ({ dialogId, onClose, overlay }),
    [dialogId, onClose, overlay],
  )
  const OverlayEl = overlay ? Overlay : Fragment

  if (!isOpen) return null
  return (
    <dialogContext.Provider value={ctxt}>
      <Portal>
        <RemoveScroll
          allowPinchZoom={allowPinchZoom}
          enabled={isScrollDisabled}
        >
          <FocusTakeoverBoundary
            id={dialogId}
            isDisabled={isFocusTakeoverDisabled}
          >
            <OverlayEl>{children}</OverlayEl>
          </FocusTakeoverBoundary>
        </RemoveScroll>
      </Portal>
    </dialogContext.Provider>
  )
}

interface DialogContext {
  dialogId: string
  onClose?: () => void
  overlay?: boolean
}

const dialogContext = createContext<DialogContext>({
  dialogId: '',
  overlay: false,
})

export const useDialogContext = () => useContext(dialogContext)

const getParentNode = (
  el?: Element | ParentNode | null,
  wrappers: number = 0,
) => {
  const parent = el?.parentNode
  if (!wrappers) return parent
  else return getParentNode(parent, wrappers - 1)
}

const createAriaHider = (newRoot: Element, wrappers: number = 0) => {
  // hide outside els from a11y tree
  const prevAriaHiddenVals: [Element, any][] = _.compact(
    Array.from(document.querySelectorAll('body > *')).map((el) => {
      const portal = getParentNode(newRoot, wrappers)
      console.log('portal: ', portal)
      if (el === portal) return null

      const prevAriaHiddenVal = el.getAttribute('aria-hidden')

      // already hidden
      if (prevAriaHiddenVal !== null && prevAriaHiddenVal !== 'false')
        return null

      el.setAttribute('aria-hidden', 'true')
      return [el, prevAriaHiddenVal]
    }),
  )

  return () => {
    // restore aria-hidden vals
    prevAriaHiddenVals.forEach(([el, prevAriaHiddenVal]) => {
      if (prevAriaHiddenVal === null) el.removeAttribute('aria-hidden')
      else el.setAttribute('aria-hidden', prevAriaHiddenVal)
    })
  }
}
