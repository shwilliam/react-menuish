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
  autoPlacement,
  autoUpdate,
  Dimensions,
  ElementRects,
  limitShift,
  offset,
  Placement,
  shift,
  size,
  flip,
  useFloating,
} from '@floating-ui/react-dom'
import useMeasure from 'react-use-measure'
import { Tray } from './tray'
import { Popout } from './popout'
import { Dialog as ModalDialog } from './modal'
import { dialogContext, DialogOptions } from './dialog'
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
    closeOnEscape: true,
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
      <DialogTrigger trigger={trigger} {...defaultVariantOptions} {...dialog}>
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
  triggerRef?: RefObject<any>
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
  noFocusLock = false,
  isolateDialog = true,
  closeOnInteractOutside = true,
  initialFocusRef,
  triggerRef: externalTriggerRef,
  closeOnEscape,
  children,
}: Require<DialogWrapperProps, 'trigger'>) => {
  const internalTriggerRef = useRef<any>()
  const triggerRef = externalTriggerRef || internalTriggerRef
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
      onClose: close,
      onOpen: open,
      triggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
      closeOnEscape,
    }),
    [
      innerDialogId,
      open,
      close,
      popover.position,
      sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
      closeOnEscape,
    ],
  )

  return (
    <>
      {trigger({ ref: stableTriggerRef, open, close })}
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
  noFocusLock = false,
  isolateDialog = true,
  closeOnInteractOutside = true,
  initialFocusRef,
  closeOnEscape,
  children,
}: DialogWrapperProps) => {
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
      onOpen,
      onClose,
      triggerRef: stableTriggerRef,
      position: popover.position,
      size: sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
      closeOnEscape,
    }),
    [
      innerDialogId,
      onOpen,
      onClose,
      stableTriggerRef,
      popover.position,
      sizeData,
      isOpen,
      overlay,
      allowPinchZoom,
      isScrollDisabled,
      noFocusLock,
      isolateDialog,
      closeOnInteractOutside,
      initialFocusRef,
      closeOnEscape,
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
  const { placement } = options
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
      _.isUndefined(placement)
        ? autoPlacement({
            alignment: 'start',
            allowedPlacements: [
              'bottom',
              'bottom-end',
              'bottom-start',
              'left',
              'left-end',
              'left-start',
              'right',
              'right-end',
              'right-start',
            ],
          })
        : flip(),
      size({ apply: (data) => setPopoverSize(data) }),
    ],
  })
  const retVal = useMemo(
    () => ({
      position,
      size: popoverSize,
    }),
    [position, popoverSize],
  )

  return retVal
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
