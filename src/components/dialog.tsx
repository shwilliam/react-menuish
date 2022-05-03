import {
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
  createContext,
  forwardRef,
  ReactNode,
  Fragment,
  ComponentPropsWithoutRef,
  RefObject,
  ComponentProps,
} from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { a, AnimatedComponent } from 'react-spring'
import { RemoveScroll } from 'react-remove-scroll'
import FocusLock from 'react-focus-lock'
import {
  Dimensions,
  ElementRects,
  UseFloatingReturn,
} from '@floating-ui/react-dom'
import { Portal } from './portal'
import { Overlay } from './overlay'
import { mergeRefs } from '../util/merge-refs'
import { Require } from '../types'
import { InteractBoundary } from './interact-boundary'

// require either aria-label or aria-labelledby to be provided

export interface DialogContentProps
  extends ComponentPropsWithoutRef<AnimatedComponent<'div'>> {
  children: ReactNode // expected to have focusable child
}

export const DialogContent = forwardRef(
  ({ children, ...props }: DialogContentProps, ref: any) => {
    const innerRef = useRef<any>()
    const wrapperRef = useRef<any>()
    const dialogCtxt = useDialogContext()
    const stableContentRef = useMemo(
      () => mergeRefs(ref, innerRef),
      [ref, innerRef],
    )
    const activateFocusLock = useCallback(() => {
      if (dialogCtxt.initialFocusRef?.current)
        dialogCtxt.initialFocusRef.current.focus?.()
    }, [dialogCtxt.initialFocusRef])
    const isModal = !dialogCtxt.noFocusLock && dialogCtxt.isolateDialog

    useEffect(() => {
      if (!dialogCtxt.isolateDialog) return
      return wrapperRef.current
        ? createAriaHider(
            wrapperRef.current,
            dialogCtxt.overlay ? 2 : 1, // number of wrappers between wrapper el and portal
          )
        : () => {}
    }, [dialogCtxt.overlay, dialogCtxt.isolateDialog])

    return (
      <FocusLock
        ref={wrapperRef}
        disabled={dialogCtxt.noFocusLock}
        onActivation={activateFocusLock}
        returnFocus
        autoFocus
      >
        <InteractBoundary
          el={wrapperRef.current}
          onClose={dialogCtxt.onClose}
          closeOnEscape={dialogCtxt.closeOnEscape}
        >
          <a.div
            ref={stableContentRef}
            {...(isModal ? { 'aria-modal': true, role: 'dialog' } : {})}
            {...props}
          >
            {children}
          </a.div>
        </InteractBoundary>
      </FocusLock>
    )
  },
)

export interface DialogProps {
  isOpen?: boolean // useful for transitions
  overlay?: ComponentProps<typeof Overlay>
  children: ReactNode
}

export const Dialog = ({
  isOpen: externalIsOpen,
  overlay,
  children,
}: DialogProps) => {
  const dialogCtxt = useDialogContext()
  const isOpen = _.isUndefined(externalIsOpen)
    ? dialogCtxt.isOpen
    : externalIsOpen
  const WrapperEl = dialogCtxt.overlay ? FsWrapper : Fragment

  if (!isOpen) return null
  return (
    <Portal>
      <RemoveScroll
        allowPinchZoom={dialogCtxt.allowPinchZoom}
        enabled={dialogCtxt.isScrollDisabled}
      >
        {dialogCtxt.overlay ? <Overlay {...overlay} /> : null}
        <WrapperEl>{children}</WrapperEl>
      </RemoveScroll>
    </Portal>
  )
}

const FsWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export type DialogSize = (Dimensions & ElementRects) & { triggerWidth?: number }

export interface DialogOptions {
  dialogId?: string
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  overlay?: boolean
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
  noFocusLock?: boolean
  isolateDialog?: boolean
  closeOnInteractOutside?: boolean
  closeOnEscape?: boolean
  initialFocusRef?: any
}

interface DialogContext extends Require<DialogOptions, 'dialogId' | 'isOpen'> {
  triggerRef?: RefObject<any>
  position?: UseFloatingReturn
  size?: Partial<DialogSize>
}

export const dialogContext = createContext<DialogContext>({
  dialogId: '',
  isOpen: false,
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
