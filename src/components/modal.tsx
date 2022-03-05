import { useRef, forwardRef } from 'react'
import styled from 'styled-components'
import useOnClickOutside from 'use-onclickoutside'
import { useSafeViewportHeightVar } from '../hooks/viewport-size'
import { mergeRefs } from '../util/merge-refs'
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogContentProps,
} from './dialog'

interface ModalProps extends DialogProps {}

export const Modal = ({ children, ...props }: ModalProps) => {
  const safeViewportHeightVar = useSafeViewportHeightVar()
  return (
    <Dialog style={safeViewportHeightVar} {...props}>
      {children}
    </Dialog>
  )
}

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
