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
} from 'react'
import _ from 'lodash'
import { a, AnimatedComponent } from 'react-spring'
import FocusLock from 'react-focus-lock'
import useOnClickOutside from 'use-onclickoutside'
import { RemoveScroll } from 'react-remove-scroll'
import {
  Dimensions,
  ElementRects,
  UseFloatingReturn,
} from '@floating-ui/react-dom'
import { Portal } from './portal'
import { Overlay } from './overlay'
import {
  FocusTakeoverBoundary,
  useFocusTakeoverContext,
} from './focus-takeover'
import { mergeRefs } from '../util/merge-refs'
import { Require } from '../types'

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
    const focusTakeoverCtxt = useFocusTakeoverContext()
    const activateFocusLock = useCallback(() => {
      if (dialogCtxt.initialFocusRef?.current) {
        dialogCtxt.initialFocusRef.current.focus?.()
        console.log('focus dialog initialFocusRef')
      }
    }, [dialogCtxt.initialFocusRef])
    const isModal = !dialogCtxt.noFocusLock && dialogCtxt.isolateDialog

    useOnClickOutside(innerRef, () => {
      if (
        !dialogCtxt.isFocusTakeoverDisabled && // handled by parent
        dialogCtxt.closeOnInteractOutside &&
        (focusTakeoverCtxt.getIsTopmost(dialogCtxt.dialogId) ||
          focusTakeoverCtxt.getIsDeactivated(dialogCtxt.dialogId))
      ) {
        console.log('close: ', dialogCtxt.dialogId)
        dialogCtxt.onClose?.()
      }
    })

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
        <a.div
          ref={stableContentRef}
          {...(isModal ? { 'aria-modal': true, role: 'dialog' } : {})}
          {...props}
        >
          {children}
        </a.div>
      </FocusLock>
    )
  },
)

export interface DialogProps {
  isOpen?: boolean // useful for transitions
  children: ReactNode
}

export const Dialog = ({ isOpen: externalIsOpen, children }: DialogProps) => {
  const dialogCtxt = useDialogContext()
  const isOpen = _.isUndefined(externalIsOpen)
    ? dialogCtxt.isOpen
    : externalIsOpen
  const OverlayEl = dialogCtxt.overlay ? Overlay : Fragment

  if (!isOpen) return null
  return (
    <Portal>
      <RemoveScroll
        allowPinchZoom={dialogCtxt.allowPinchZoom}
        enabled={dialogCtxt.isScrollDisabled}
      >
        <FocusTakeoverBoundary
          id={dialogCtxt.dialogId}
          isDisabled={dialogCtxt.isFocusTakeoverDisabled}
          onClose={dialogCtxt.onClose}
          onActivate={() => console.log('activate: ', dialogCtxt.dialogId)}
          onRestore={() => {
            console.log('deactivate: ', dialogCtxt.dialogId)
            requestAnimationFrame(() => {
              console.log('try focus deez: ', dialogCtxt.triggerRef?.current)
              dialogCtxt.triggerRef?.current?.focus?.()
            })
          }}
        >
          <OverlayEl>{children}</OverlayEl>
        </FocusTakeoverBoundary>
      </RemoveScroll>
    </Portal>
  )
}

export type DialogSize = (Dimensions & ElementRects) & { triggerWidth?: number }

export interface DialogOptions {
  dialogId?: string
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  overlay?: boolean
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
  isFocusTakeoverDisabled?: boolean
  noFocusLock?: boolean
  isolateDialog?: boolean
  closeOnInteractOutside?: boolean
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
