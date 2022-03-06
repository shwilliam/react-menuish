import { forwardRef } from 'react'
import styled from 'styled-components'
import useOnClickOutside from 'use-onclickoutside'
import { useId } from '@react-aria/utils'
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { Overlay, OverlayProps } from './overlay'
import { useFocusTakeoverContext } from './focus-takeover'

interface ModalProps extends DialogProps {
  overlay?: OverlayProps
}

export const Modal = forwardRef(
  ({ id, overlay = {}, children, ...props }: ModalProps, ref: any) => {
    const innerId = useId(id)

    return (
      <Dialog id={innerId} {...props}>
        <Overlay ref={ref} {...overlay}>
          {children}
        </Overlay>
      </Dialog>
    )
  },
)

interface ModalContentProps extends DialogContentProps {
  onClose?: () => void
}

export const ModalContent = forwardRef(
  ({ onClose, children, ...props }: ModalContentProps, ref) => {
    const { isActiveFocusBoundary } = useFocusTakeoverContext()
    const { contentRef, dialogId } = useDialogContext()

    useOnClickOutside(contentRef, () => {
      if (dialogId && isActiveFocusBoundary(dialogId)) onClose?.()
    })

    return (
      <StyledModalContent ref={ref} {...props}>
        {children}
      </StyledModalContent>
    )
  },
)

const StyledModalContent = styled(DialogContent)`
  border: 1px solid blue;
  padding: 16px;
  max-height: var(--menuish-visual-viewport-height);
  overflow-y: auto;
`
