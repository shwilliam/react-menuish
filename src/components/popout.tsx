import { useEffect } from 'react'
import _ from 'lodash'
import { autoUpdate } from '@floating-ui/react-dom'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { useMounted } from '../hooks/mounted'

export interface PopoutProps extends DialogContentProps {
  maxHeight?: number
  maxWidth?: number
  width?: 'trigger' | 'auto'
}

export const Popout = ({
  maxHeight,
  maxWidth,
  width,
  children,
  ...props
}: PopoutProps) => {
  const { position, size, isOpen } = useDialogContext()
  const { x, y, floating, strategy, refs, update } = position || {}
  const popoutMaxHeight =
    size?.height || maxHeight
      ? Math.min(size?.height || Infinity, maxHeight || Infinity)
      : 0
  // const popoutMaxWidth =
  //   size?.width || maxWidth
  //     ? Math.min(size?.width || Infinity, maxWidth || Infinity)
  //     : 0

  const floatingEl = refs?.floating.current
  useEffect(() => {
    if (!refs || !update || !refs.reference.current || !refs.floating.current)
      return
    return autoUpdate(refs.reference.current, refs.floating.current, update)
  }, [refs, floatingEl, update, isOpen])

  return (
    <Dialog>
      <DialogContent
        ref={floating}
        {...props}
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          maxHeight: popoutMaxHeight ? `${popoutMaxHeight}px` : '',
          // maxWidth: popoutMaxWidth ? `${popoutMaxWidth}px` : '',
          background: 'white',
          overflow: 'auto',
          border: '1px solid red',
          ...(width === 'trigger'
            ? { width: size?.triggerWidth ? `${size?.triggerWidth}px` : '' }
            : {}),
          ...(props.style || {}),
        }}
      >
        {_.isNull(x) ? null : children}
      </DialogContent>
    </Dialog>
  )
}
