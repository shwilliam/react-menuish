import {
  useState,
  useEffect,
  ReactNode,
  MutableRefObject,
  useMemo,
  ComponentPropsWithoutRef,
} from 'react'
import {
  useFloating,
  shift,
  flip,
  size,
  limitShift,
  Dimensions,
  ElementRects,
  Placement,
  autoUpdate,
  offset,
} from '@floating-ui/react-dom'
import useMeasure from 'react-use-measure'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogProps,
} from './dialog'
import { TrayContentProps } from './tray'
import { ModalContentProps } from './modal'
import { useSyncedRef } from '../hooks/synced-ref'
import { mergeRefs } from '../util/merge-refs'

export interface PopoutTriggerContext extends ComponentPropsWithoutRef<any> {
  ref: MutableRefObject<any> | null
}

interface DialogBaseProps extends DialogProps {
  onOpen?: () => void
}

interface PopoutOptions {
  trigger: (triggerContext: PopoutTriggerContext) => ReactNode
  content?: Omit<DialogContentProps, 'children'>
  placement?: Placement
  maxHeight?: number
  width?: 'trigger' | 'auto'
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
  onOpen,
  onClose,
  trigger,
  placement = 'bottom',
  maxHeight,
  width,
  content,
  children,
  ...props
}: PopoutProps) => {
  const [sizeData, setSizeData] = useState<Dimensions & ElementRects>()
  const [measureRef, { width: measureWidth }] = useMeasure()
  const { x, y, floating, strategy, refs, update } = useFloating({
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
      size({ apply: (data) => setSizeData(data) }),
    ],
  })
  const stableTriggerRef = useMemo(
    () => mergeRefs(refs.reference, measureRef),
    [refs.reference, measureRef],
  )
  const popoutMaxHeight =
    sizeData?.height || maxHeight
      ? Math.min(sizeData?.height || Infinity, maxHeight || Infinity)
      : 0

  const floatingEl = refs.floating.current
  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) return
    return autoUpdate(refs.reference.current, refs.floating.current, update)
  }, [refs.reference, refs.floating, floatingEl, update, isOpen])

  const onOpenRef = useSyncedRef(onOpen)
  useEffect(() => {
    if (isOpen) onOpenRef.current?.()
  }, [isOpen])

  return (
    <>
      {trigger({ ref: stableTriggerRef, ...props })}
      <Dialog isOpen={isOpen} isScrollDisabled={false} onClose={onClose}>
        <DialogContent
          ref={floating}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            maxHeight: popoutMaxHeight ? `${popoutMaxHeight}px` : '',
            overflow: 'auto',
            border: '1px solid red',
            ...(width === 'trigger'
              ? { width: measureWidth ? `${measureWidth}px` : '' }
              : {}),
          }}
          {...content}
        >
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
