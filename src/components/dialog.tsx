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
  Component,
  FunctionComponent,
  ComponentProps,
  ComponentType,
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
import { PopoutBase, PopoutProps } from './popout'

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
    }, [isolateDialog, overlay])

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
  isOpen?: boolean
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
  isFocusTakeoverDisabled?: boolean
  overlay?: boolean
  children: ReactNode
}

export const Dialog = ({
  isOpen: externalIsOpen,
  allowPinchZoom = false,
  isScrollDisabled = true,
  isFocusTakeoverDisabled = false,
  overlay = false,
  children,
}: DialogProps) => {
  const dialogCtxt = useDialogContext()
  const isOpen = _.isUndefined(externalIsOpen)
    ? dialogCtxt.isOpen
    : externalIsOpen
  const OverlayEl = overlay ? Overlay : Fragment

  if (!isOpen) return null
  return (
    <Portal>
      <RemoveScroll allowPinchZoom={allowPinchZoom} enabled={isScrollDisabled}>
        <FocusTakeoverBoundary
          id={dialogCtxt.dialogId}
          isDisabled={isFocusTakeoverDisabled}
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
}

export type DialogSize = (Dimensions & ElementRects) & { triggerWidth?: number }

const dialogContext = createContext<DialogContext>({
  isOpen: false,
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

interface DialogVariantTriggerProps {
  ref: MutableRefObject<any>
  open: () => void
  close: () => void
}
interface DialogVariantProps {
  id?: string
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  overlay?: boolean
  trigger?: (props: DialogVariantTriggerProps) => ReactNode
  placement?: Placement
  position?: PopoverPosition
}

const dialogVariantProps = [
  'id',
  'isOpen',
  'onOpen',
  'onClose',
  'overlay',
  'trigger',
  'placement',
  'position',
]

export const pickDialogVariantProps = (o) =>
  _.pick(o, dialogVariantProps) as DialogVariantProps

export const createDialogVariant =
  <C,>(Comp: FunctionComponent<C>) =>
  ({
    trigger,
    id,
    isOpen,
    onOpen,
    onClose,
    overlay,
    placement,
    position,
    ...props
  }: C & DialogVariantProps) => {
    const wrapperProps = useMemo(
      () => ({
        id,
        isOpen,
        onOpen,
        onClose,
        overlay,
      }),
      [id, isOpen, onOpen, onClose, overlay],
    )

    if (trigger)
      return (
        <DialogTrigger
          trigger={trigger}
          placement={placement}
          {...wrapperProps}
        >
          <Comp {...props} />
        </DialogTrigger>
      )

    return (
      <DialogContainer position={position} {...wrapperProps}>
        <Comp {...props} />
      </DialogContainer>
    )
  }

interface DialogTriggerProps {
  id?: string
  isOpen?: boolean
  onClose?: () => void
  onOpen?: () => void
  placement?: Placement
  trigger: (props: any) => ReactNode // FIXME: type
  overlay?: boolean
  children: ReactNode
}

export const DialogTrigger = ({
  id,
  isOpen: externalIsOpen,
  onClose,
  onOpen,
  placement,
  trigger,
  overlay = false,
  children,
}: DialogTriggerProps) => {
  const [innerIsOpen, setInnerIsOpen] = useState(false)
  const isOpen = !!(_.isUndefined(externalIsOpen)
    ? innerIsOpen
    : externalIsOpen)
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition({ placement })
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef),
    [popover.position.refs.reference, measureRef],
  )
  const dialogId = useId(id)
  const sizeData = useMemo(
    () => ({ ...popover.size, triggerWidth }),
    [popover.size, triggerWidth],
  )
  const close = useCallback(() => {
    setInnerIsOpen(false)
    onClose?.()
  }, [onClose])
  const open = useCallback(() => {
    setInnerIsOpen(true)
    onOpen?.()
  }, [onOpen])
  const ctxt = useMemo(
    () => ({
      dialogId,
      onClose: close,
      onOpen: open,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
    }),
    [
      dialogId,
      open,
      close,
      stableTriggerRef,
      popover.position,
      sizeData,
      isOpen,
      overlay,
    ],
  )

  return (
    <>
      {trigger({ ref: stableTriggerRef, open, close })}
      <dialogContext.Provider value={ctxt}>{children}</dialogContext.Provider>
    </>
  )
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

export interface PopoverPosition {
  x: number
  y: number
}

interface DialogContainerProps {
  id?: string
  isOpen?: boolean
  onClose?: () => void
  position?: PopoverPosition
  overlay?: boolean
  children: ReactNode
}

export const DialogContainer = ({
  id,
  isOpen = false,
  onClose,
  position,
  overlay = false,
  children,
}: DialogContainerProps) => {
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition()
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef),
    [popover.position.refs.reference, measureRef],
  )
  const dialogId = useId(id)
  const sizeData = useMemo(
    () => ({ ...popover.size, triggerWidth }),
    [popover.size, triggerWidth],
  )
  const ctxt = useMemo(
    () => ({
      dialogId,
      onClose,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
    }),
    [
      dialogId,
      onClose,
      stableTriggerRef,
      popover.position,
      sizeData,
      isOpen,
      overlay,
    ],
  )

  useEffect(() => {
    if (
      isOpen &&
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
    isOpen,
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
    if (isOpen) {
      popover.position.refs.floating.current?.focus()
    }
  }, [isOpen, popover.position.refs.floating])

  return (
    <dialogContext.Provider value={ctxt}>{children}</dialogContext.Provider>
  )
}
