import { useEffect, ReactNode, forwardRef, useMemo } from 'react'
import { autoUpdate } from '@floating-ui/react-dom'
import {
  Dialog,
  DialogContent,
  DialogVariant,
  GetDialogVariantProps,
  useDialogContext,
} from './dialog'
import { mergeRefs } from '../util/merge-refs'

export interface PopoutBaseProps {
  maxHeight?: number
  // maxWidth?: number
  width?: 'trigger' | 'auto'
  children: ReactNode
}

export const PopoutBase = forwardRef(
  (
    {
      maxHeight,
      // maxWidth,
      width,
      children,
    }: PopoutBaseProps,
    ref,
  ) => {
    const { size, isOpen, position } = useDialogContext()
    const { x, y, floating, strategy, refs, update } = position || {}
    const popoutMaxHeight =
      size?.height || maxHeight
        ? Math.min(size?.height || Infinity, maxHeight || Infinity)
        : 0
    const stableRef = useMemo(() => mergeRefs(floating, ref), [floating, ref])
    // const popoutMaxWidth =
    //   sizeData?.width || maxWidth
    //     ? Math.min(sizeData?.width || Infinity, maxWidth || Infinity)
    //     : 0

    const floatingEl = refs?.floating.current
    useEffect(() => {
      if (!refs || !update || !refs.reference.current || !refs.floating.current)
        return
      return autoUpdate(refs.reference.current, refs.floating.current, update)
    }, [refs, floatingEl, update, isOpen])

    // const onOpenRef = useSyncedRef(onOpen)
    // useEffect(() => {
    //   if (isOpen) onOpenRef.current?.()
    // }, [isOpen])

    return (
      <Dialog>
        <DialogContent
          ref={stableRef}
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            maxHeight: popoutMaxHeight ? `${popoutMaxHeight}px` : '',
            // maxWidth: popoutMaxWidth ? `${popoutMaxWidth}px` : '',
            maxWidth: '100%',
            overflow: 'auto',
            border: '1px solid red',
            ...(width === 'trigger' && size
              ? { width: size.triggerWidth ? `${size.triggerWidth}px` : '' }
              : {}),
          }}
        >
          {children}
        </DialogContent>
      </Dialog>
    )
  },
)

type PopoutProps = GetDialogVariantProps<PopoutBaseProps>
export const Popout = forwardRef(
  ({ options, children, ...props }: PopoutProps, ref) => (
    <DialogVariant isScrollDisabled={false} {...props}>
      <PopoutBase ref={ref} {...options}>
        {children}
      </PopoutBase>
    </DialogVariant>
  ),
)
