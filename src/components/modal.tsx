import { useRef, forwardRef } from 'react'
import styled from 'styled-components'
import useOnClickOutside from 'use-onclickoutside'
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogContentProps,
} from './dialog'
import { Overlay, OverlayProps } from './overlay'
import { mergeRefs } from '../util/merge-refs'

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

interface ModalContentProps extends DialogContentProps {
  onClose?: () => void
}

export const ModalContent = forwardRef(
  ({ onClose, children, ...props }: ModalContentProps, ref) => {
    const innerRef = useRef<any>()
    useOnClickOutside(innerRef, () => onClose?.())
    return (
      <StyledModalContent ref={mergeRefs(innerRef, ref)} {...props}>
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
