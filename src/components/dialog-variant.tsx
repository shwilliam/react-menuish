import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ComponentProps,
} from 'react'
import _ from 'lodash'
import {
  autoUpdate,
  Dimensions,
  ElementRects,
  flip,
  limitShift,
  offset,
  Placement,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-dom'
import { useDialogContext, dialogContext, DialogOptions } from './dialog'
import useMeasure from 'react-use-measure'
import { Tray } from './tray'
import { Popout } from './popout'
import { Dialog as ModalDialog } from './modal'
import { mergeRefs } from '../util/merge-refs'
import { useIsMobile } from '../hooks/is-mobile'
import { useId } from '../hooks/id'
import { Require } from '../types'

export interface DialogVariantProps<
  T extends DialogVariantType,
  M extends DialogVariantType | undefined,
> {
  type: T
  mobileType?: M
  dialog?: Omit<DialogWrapperProps, 'children' | 'trigger'>
  trigger?: DialogWrapperProps['trigger']
  children: ReactNode
}

const variantTypeComponent = {
  popout: Popout,
  modal: ModalDialog,
  tray: Tray,
}
export type DialogVariantType = keyof typeof variantTypeComponent

const defaultDialogOptions = {
  popout: {
    isScrollDisabled: false,
  },
  modal: {
    overlay: true,
  },
  tray: {
    overlay: true,
  },
}

export type GetDialogVariantProps<
  T extends DialogVariantType,
  M extends DialogVariantType | undefined,
> = DialogVariantProps<T, M> &
  ComponentProps<typeof variantTypeComponent[T]> & {
    mobileOptions?: M extends DialogVariantType
      ? Omit<ComponentProps<typeof variantTypeComponent[M]>, 'children'>
      : never
  }

export const DialogVariant = <
  T extends DialogVariantType,
  M extends DialogVariantType | undefined,
>({
  type,
  mobileType = type,
  trigger,
  dialog = {},
  mobileOptions,
  listIdx,
  children,
  ...props
}: GetDialogVariantProps<T, M>) => {
  const isMobile = useIsMobile()
  const variantType = (isMobile && mobileType) || type
  const Comp = variantTypeComponent[variantType]
  const compProps = (isMobile && mobileOptions) || props
  const defaultVariantOptions = defaultDialogOptions[variantType]

  if (trigger) {
    return (
      <DialogTrigger
        trigger={(args) => trigger({ ...args, listIdx })}
        {...defaultVariantOptions}
        {...dialog}
      >
        <Comp {...compProps}>{children}</Comp>
      </DialogTrigger>
    )
  }

  return (
    <DialogContainer {...defaultVariantOptions} {...dialog}>
      <Comp {...compProps}>{children}</Comp>
    </DialogContainer>
  )
}

export interface DialogVariantTriggerProps {
  ref: RefObject<any>
  open: () => void
  close: () => void
}

interface DialogWrapperProps extends DialogOptions {
  trigger?: (props: DialogVariantTriggerProps) => ReactNode
  placement?: Placement
  position?: PopoverPosition
  children: ReactNode
}

export const DialogTrigger = ({
  dialogId,
  isOpen: externalIsOpen,
  onOpen,
  onClose,
  placement,
  trigger,
  overlay = false,
  allowPinchZoom = false,
  isScrollDisabled = true,
  isFocusTakeoverDisabled = false,
  noFocusLock = false,
  isolateDialog = true,
  closeOnInteractOutside = true,
  initialFocusRef,
  children,
  ...props
}: Require<DialogWrapperProps, 'trigger'>) => {
  const triggerRef = useRef<any>()
  const parentDialogCtxt = useDialogContext()
  const [innerIsOpen, setInnerIsOpen] = useState(false)
  const isOpen = !!(_.isUndefined(externalIsOpen)
    ? innerIsOpen
    : externalIsOpen)
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition({ placement })
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef, triggerRef),
    [popover.position.refs.reference, measureRef],
  )
  const innerDialogId = useId(dialogId)
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
      dialogId: innerDialogId,
      parentDialogId: parentDialogCtxt.dialogId,
      onClose: close,
      onOpen: open,
      triggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      isFocusTakeoverDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
    }),
    [
      innerDialogId,
      parentDialogCtxt.dialogId,
      open,
      close,
      popover.position,
      sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      isFocusTakeoverDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
    ],
  )

  return (
    <>
      {trigger({ ref: stableTriggerRef, open, close, ...props })}
      <dialogContext.Provider value={ctxt}>{children}</dialogContext.Provider>
    </>
  )
}

export const DialogContainer = ({
  dialogId,
  isOpen = false,
  onOpen,
  onClose,
  position,
  overlay = false,
  allowPinchZoom = false,
  isScrollDisabled = true,
  isFocusTakeoverDisabled = false,
  noFocusLock = false,
  isolateDialog = true,
  closeOnInteractOutside = true,
  initialFocusRef,
  children,
}: DialogWrapperProps) => {
  const parentDialogCtxt = useDialogContext()
  const [measureRef, { width: triggerWidth }] = useMeasure()
  const popover = usePopoverPosition()
  const stableTriggerRef = useMemo(
    () => mergeRefs(popover.position.refs.reference, measureRef),
    [popover.position.refs.reference, measureRef],
  )
  const innerDialogId = useId(dialogId)
  const sizeData = useMemo(
    () => ({ ...popover.size, triggerWidth }),
    [popover.size, triggerWidth],
  )
  const ctxt = useMemo(
    () => ({
      dialogId: innerDialogId,
      parentDialogId: parentDialogCtxt.dialogId,
      onOpen,
      onClose,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      isFocusTakeoverDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
    }),
    [
      innerDialogId,
      parentDialogCtxt.dialogId,
      onOpen,
      onClose,
      stableTriggerRef,
      popover.position,
      sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      isFocusTakeoverDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
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

export type PopoutVariantProps<M extends DialogVariantType | undefined> = Omit<
  GetDialogVariantProps<'popout', M>,
  'type'
>
export const PopoutVariant = <M extends DialogVariantType | undefined>(
  props: PopoutVariantProps<M>,
) => <DialogVariant type="popout" mobileType="tray" {...props} />

export type ModalVariantProps<M extends DialogVariantType | undefined> = Omit<
  GetDialogVariantProps<'modal', M>,
  'type'
>
export const ModalVariant = <M extends DialogVariantType | undefined>(
  props: ModalVariantProps<M>,
) => <DialogVariant type="modal" {...props} />

export type TrayVariantProps<M extends DialogVariantType | undefined> = Omit<
  GetDialogVariantProps<'tray', M>,
  'type'
>
export const TrayVariant = <M extends DialogVariantType | undefined>(
  props: TrayVariantProps<M>,
) => <DialogVariant type="tray" {...props} />
