import { ForwardedRef, forwardRef, useEffect, ComponentProps } from 'react'
import _ from 'lodash'
import { autoUpdate } from '@floating-ui/react-dom'
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import styled from 'styled-components'

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
          overflowY: 'auto',
          ...(width === 'trigger'
            ? { width: size?.triggerWidth ? `${size?.triggerWidth}px` : '' }
            : {}),
          ...(props.style || {}),
        }}
      >
        {_.isNull(x) ? null : <>{children}</>}
      </DialogContent>
    </Dialog>
  )
}

interface PopoutCardProps extends ComponentProps<'div'> {}

export const PopoutCard = forwardRef(
  ({ children, ...props }: PopoutCardProps, ref: ForwardedRef<any>) => (
    <div
      ref={ref}
      style={{
        padding: '16px 8px',
        borderRadius: '4px',
      }}
      {...props}
    >
      <PopoutCloseButton />
      {children}
    </div>
  ),
)

interface PopoutCloseButtonProps extends ComponentProps<'button'> {}

const PopoutCloseButton = forwardRef(
  (props: PopoutCloseButtonProps, ref: any) => {
    const dialogCtxt = useDialogContext()
    return (
      <StyledCloseButton ref={ref} onClick={dialogCtxt.onClose} {...props}>
        <span role="img" aria-label="close">
          x
        </span>
      </StyledCloseButton>
    )
  },
)

const StyledCloseButton = styled.button`
  position: absolute;
  top: -2px;
  right: 2px;
  padding: 2px;
  background: none;
  border: none;
`
