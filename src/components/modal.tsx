import { forwardRef } from 'react'
import styled from 'styled-components'
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogContentProps,
} from './dialog'
import { Overlay, OverlayProps } from './overlay'
import { VISUAL_VIEWPORT_HEIGHT_VAR } from '../hooks/viewport-size'

interface ModalProps extends DialogProps {
  overlay?: OverlayProps
}

export const Modal = forwardRef(
  ({ overlay = {}, children, ...props }: ModalProps, ref: any) => {
    return (
      <Dialog {...props}>
        <Overlay ref={ref} {...overlay}>
          {children}
        </Overlay>
      </Dialog>
    )
  },
)

interface ModalContentProps extends DialogContentProps {}

export const ModalContent = forwardRef(
  ({ children, ...props }: ModalContentProps, ref) => {
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
  max-height: var(${VISUAL_VIEWPORT_HEIGHT_VAR});
  overflow-y: auto;
`
