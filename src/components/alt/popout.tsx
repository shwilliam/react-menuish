import { useState, useEffect, forwardRef, ReactNode } from 'react'
import {
  useFloating,
  shift,
  flip,
  offset,
  size,
  limitShift,
  Dimensions,
  ElementRects,
  Placement,
  autoUpdate,
} from '@floating-ui/react-dom'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogProps,
} from './dialog'
import { TrayContentProps } from './tray'
import { ModalContentProps } from './modal'

export interface PopoutTriggerContext {
  anchorRef: any
}

interface DialogBaseProps extends DialogProps {}

interface PopoutOptions {
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  placement?: Placement
  content?: Omit<PopoutContentProps, 'children'>
  dialog?: Omit<DialogProps, 'children'>
  maxHeight?: number
}
export interface PopoutProps extends DialogBaseProps, PopoutOptions {}
interface PopoutVariantProps extends PopoutProps {
  type: 'popout'
}

interface TrayOptions {
  content?: Omit<TrayContentProps, 'children'>
}
export interface TrayProps extends DialogBaseProps, TrayOptions {}
interface TrayVariantProps extends TrayProps {
  type: 'tray'
}

interface ModalOptions {
  content?: Omit<ModalContentProps, 'children'>
}
export interface ModalProps extends DialogBaseProps, ModalOptions {}
interface ModalVariantProps extends ModalProps {
  type: 'modal'
}

type AnyDialogVariantProps =
  | PopoutVariantProps
  | TrayVariantProps
  | ModalVariantProps
export type DialogVariantProps = AnyDialogVariantProps & {
  mobile?: AnyDialogVariantProps
}

export const Popout = ({
  isOpen = false,
  onClose,
  trigger,
  placement = 'bottom',
  maxHeight,
  dialog,
  content,
  children,
  ...props
}: PopoutProps) => {
  const [sizeData, setSizeData] = useState<Dimensions & ElementRects>()
  const { x, y, reference, floating, strategy, refs, update } = useFloating({
    placement,
    middleware: [
      // offset(10),
      shift({
        limiter: limitShift({
          offset: ({ reference, floating, placement }) => ({
            mainAxis: reference.height,
          }),
        }),
      }),
      flip(),
      size({ apply: (data) => setSizeData(data) }),
    ],
  })
  const popoutMaxHeight =
    sizeData?.height || maxHeight
      ? Math.min(sizeData?.height || Infinity, maxHeight || Infinity)
      : 0

  const floatingEl = refs.floating.current
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) return
    return autoUpdate(refs.reference.current, refs.floating.current, update)
  }, [refs.reference, refs.floating, floatingEl, update, isOpen])

  return (
    <>
      {trigger({ anchorRef: reference, ...props })}
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        isScrollDisabled={false}
        {...dialog}
      >
        <PopoutContent
          ref={floating}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            maxHeight: popoutMaxHeight ? `${popoutMaxHeight}px` : '',
            maxWidth: sizeData?.width ? `${sizeData.width}px` : '',
            overflow: 'auto',
          }}
          {...content}
        >
          {children}
        </PopoutContent>
      </Dialog>
    </>
  )
}

interface PopoutContentProps extends DialogContentProps {}

const PopoutContent = forwardRef(
  ({ children, ...props }: PopoutContentProps, ref: any) => {
    return (
      <DialogContent ref={ref} {...props}>
        {children}
      </DialogContent>
    )
  },
)
