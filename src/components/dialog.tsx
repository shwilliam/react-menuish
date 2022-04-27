import {
  useState,
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
  useLayoutEffect,
  MutableRefObject,
} from 'react'
import _ from 'lodash'
import {
  useFloating,
  shift,
  flip,
  size,
  limitShift,
  Dimensions,
  ElementRects,
  offset,
  autoUpdate,
  UseFloatingReturn,
  Placement,
} from '@floating-ui/react-dom'
import useMeasure from 'react-use-measure'
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
import { Require } from '../types'

// require either aria-label or aria-labelledby to be provided

export interface DialogContentProps extends ComponentPropsWithoutRef<'div'> {
  style?: CSSProperties
  children: ReactNode // expected to have focusable child
}

export const DialogContent = forwardRef(
  ({ children, ...props }: DialogContentProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    const innerRef = useRef<any>()
    const wrapperRef = useRef<any>()
    const stableContentRef = useMemo(
      () => mergeRefs(ref, innerRef),
      [ref, innerRef],
    )
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const activateFocusLock = useCallback(() => {
      if (dialogCtxt.initialFocusRef?.current)
        dialogCtxt.initialFocusRef.current.focus?.()
    }, [dialogCtxt.initialFocusRef])
    const isModal = !dialogCtxt.noFocusLock && dialogCtxt.isolateDialog

    useOnClickOutside(innerRef, () => {
      if (
        dialogCtxt.closeOnInteractOutside &&
        isActiveFocusBoundary(dialogCtxt.dialogId)
      )
        dialogCtxt.onClose?.()
    })

    useEffect(() => {
      if (!dialogCtxt.isolateDialog) return
      return wrapperRef.current
        ? createAriaHider(
            wrapperRef.current,
            dialogCtxt.overlay ? 2 : 1, // number of wrappers between wrapper el and portal
          )
        : () => {}
    }, [dialogCtxt.isolateDialog, dialogCtxt.overlay])

    return (
      <FocusLock
        ref={wrapperRef}
        disabled={dialogCtxt.noFocusLock}
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
  isOpen?: boolean
  children: ReactNode
}

export const Dialog = ({ children, ...props }: DialogProps) => {
  const dialogCtxt = useDialogContext()
  const isOpen = _.isUndefined(props.isOpen) ? dialogCtxt.isOpen : props.isOpen
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
        >
          <OverlayEl>{children}</OverlayEl>
        </FocusTakeoverBoundary>
      </RemoveScroll>
    </Portal>
  )
}

interface DialogContext {
  dialogId: string
  overlay: boolean
  isOpen: boolean
  triggerRef?: MutableRefObject<any>
  position?: UseFloatingReturn
  size?: Partial<DialogSize>
  onClose?: () => void
  onOpen?: () => void
  allowPinchZoom: boolean
  isScrollDisabled: boolean
  isFocusTakeoverDisabled: boolean
  noFocusLock: boolean
  isolateDialog: boolean
  closeOnInteractOutside: boolean
  initialFocusRef?: any
}

export type DialogSize = (Dimensions & ElementRects) & { triggerWidth?: number }

const defaultDialogVariantOptions = {
  isOpen: false,
  overlay: false,
  allowPinchZoom: false,
  isScrollDisabled: true,
  isFocusTakeoverDisabled: false,
  noFocusLock: false,
  isolateDialog: true,
  closeOnInteractOutside: true,
}

const dialogContext = createContext<DialogContext>({
  dialogId: '',
  ...defaultDialogVariantOptions,
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

interface DialogTriggerProps extends Require<DialogVariantProps, 'trigger'> {}

export const DialogTrigger = ({
  placement,
  trigger,
  children,
  ...props
}: DialogTriggerProps) => {
  const [innerIsOpen, setInnerIsOpen] = useState(false)
  const isOpen = !!(_.isUndefined(props.isOpen) ? innerIsOpen : props.isOpen)
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition({ placement })
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef),
    [popover.position.refs.reference, measureRef],
  )
  const innerDialogId = useId(props.dialogId)
  const sizeData = useMemo(
    () => ({ ...popover.size, triggerWidth }),
    [popover.size, triggerWidth],
  )
  const close = useCallback(() => {
    setInnerIsOpen(false)
    props.onClose?.()
  }, [props.onClose])
  const open = useCallback(() => {
    setInnerIsOpen(true)
    props.onOpen?.()
  }, [props.onOpen])
  const ctxt = useMemo(
    () => ({
      ...defaultDialogVariantOptions,
      ...props,
      dialogId: innerDialogId,
      isOpen,
      onClose: close,
      onOpen: open,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
    }),
    [
      innerDialogId,
      isOpen,
      open,
      close,
      stableTriggerRef,
      popover.position,
      sizeData,
      props,
    ],
  )

  return (
    <>
      {trigger({ ref: stableTriggerRef, open, close })}
      <dialogContext.Provider value={ctxt}>{children}</dialogContext.Provider>
    </>
  )
}

interface DialogContainerProps extends DialogVariantProps {}

export const DialogContainer = ({
  position,
  children,
  ...props
}: DialogContainerProps) => {
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition()
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef),
    [popover.position.refs.reference, measureRef],
  )
  const innerDialogId = useId(props.dialogId)
  const sizeData = useMemo(
    () => ({ ...popover.size, triggerWidth }),
    [popover.size, triggerWidth],
  )
  const ctxt = useMemo(
    () => ({
      ...defaultDialogVariantOptions,
      ...props,
      dialogId: innerDialogId,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
    }),
    [innerDialogId, stableTriggerRef, popover.position, sizeData, props],
  )

  useEffect(() => {
    if (
      props.isOpen &&
      popover.position.refs.reference.current &&
      popover.position.refs.floating.current
    ) {
      return autoUpdate(
        popover.position.refs.reference.current,
        popover.position.refs.floating.current,
        popover.position.update,
      )
    }
  }, [
    props.isOpen,
    popover.position.update,
    popover.position.refs.reference,
    popover.position.refs.floating,
  ])

  useLayoutEffect(() => {
    if (!position) return
    popover.position.reference({
      getBoundingClientRect() {
        return {
          x: position.x,
          y: position.y,
          width: 0,
          height: 0,
          top: position.y,
          right: position.x,
          bottom: position.y,
          left: position.x,
        }
      },
    })
  }, [position, popover.position.reference])

  useLayoutEffect(() => {
    if (props.isOpen) {
      popover.position.refs.floating.current?.focus()
    }
  }, [props.isOpen, popover.position.refs.floating])

  return (
    <dialogContext.Provider value={ctxt}>{children}</dialogContext.Provider>
  )
}

interface DialogVariantTriggerProps {
  ref: MutableRefObject<any>
  open: () => void
  close: () => void
}

export interface DialogVariantProps {
  trigger?: (props: DialogVariantTriggerProps) => ReactNode
  placement?: Placement
  position?: PopoverPosition
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
  children: ReactNode
}

export type GetDialogVariantProps<P extends { children }> = Omit<
  DialogVariantProps,
  'children'
> & {
  options?: Omit<P, 'children'>
  children: P['children']
}

export const DialogVariant = ({ trigger, ...props }: DialogVariantProps) => {
  if (trigger) return <DialogTrigger trigger={trigger} {...props} />
  return <DialogContainer {...props} />
}

export interface PopoverPosition {
  x: number
  y: number
}

interface UsePopoverPositionOptions {
  placement?: Placement
}

export const usePopoverPosition = (options: UsePopoverPositionOptions = {}) => {
  const { placement = 'bottom' } = options
  const [popoverSize, setPopoverSize] = useState<Dimensions & ElementRects>()
  const position = useFloating({
    placement,
    middleware: [
      offset(2),
      shift({
        limiter: limitShift({
          offset: ({ reference, floating, placement }) => ({
            mainAxis: reference.height,
          }),
        }),
      }),
      flip(),
      size({ apply: (data) => setPopoverSize(data) }),
    ],
  })

  return { position, size: popoverSize }
}
