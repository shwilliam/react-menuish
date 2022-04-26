import {
  useEffect,
  MutableRefObject,
  ComponentPropsWithoutRef,
  memo,
} from 'react'
import { autoUpdate } from '@floating-ui/react-dom'
import { ModalContentProps } from './modal'
import {
  createDialogVariant,
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogProps,
  useDialogContext,
} from './dialog'
import { TrayContentProps } from './tray'
import { useSyncedRef } from '../hooks/synced-ref'

export interface PopoutTriggerContext extends ComponentPropsWithoutRef<any> {
  ref: MutableRefObject<any> | null
}

interface DialogBaseProps extends DialogProps {
  onOpen?: () => void
}

interface PopoutOptions {
  content?: Omit<DialogContentProps, 'children'>
  maxHeight?: number
  maxWidth?: number
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

export const PopoutBase = ({
  onOpen,
  maxHeight,
  maxWidth,
  width,
  content,
  children,
  ...props
}: PopoutProps) => {
  const { position, size, isOpen } = useDialogContext()
  const { x, y, floating, strategy, refs, update } = position
  const popoutMaxHeight =
    size?.height || maxHeight
      ? Math.min(size?.height || Infinity, maxHeight || Infinity)
      : 0
  // const popoutMaxWidth =
  //   sizeData?.width || maxWidth
  //     ? Math.min(sizeData?.width || Infinity, maxWidth || Infinity)
  //     : 0

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
    <Dialog isScrollDisabled={false}>
      <DialogContent
        ref={floating}
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          maxHeight: popoutMaxHeight ? `${popoutMaxHeight}px` : '',
          // maxWidth: popoutMaxWidth ? `${popoutMaxWidth}px` : '',
          maxWidth: '100%',
          overflow: 'auto',
          border: '1px solid red',
          ...(width === 'trigger'
            ? { width: size.triggerWidth ? `${size.triggerWidth}px` : '' }
            : {}),
        }}
        {...content}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export const Popout = memo(createDialogVariant(PopoutBase))
