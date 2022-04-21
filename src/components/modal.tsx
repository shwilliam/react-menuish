import { forwardRef } from 'react'
import styled from 'styled-components'
import { Dialog, DialogContent, DialogContentProps } from './dialog'
import { Overlay } from './overlay'
import { ModalProps } from './popout'
import { VISUAL_VIEWPORT_HEIGHT_VAR } from '../hooks/viewport-size'

export const Modal = forwardRef(
  ({ content, children, ...props }: ModalProps, ref: any) => {
    return (
      <Dialog {...props}>
        <Overlay>
          <ModalContent {...content}>{children}</ModalContent>
        </Overlay>
      </Dialog>
    )
  },
)

export interface ModalContentProps extends DialogContentProps {}

const ModalContent = styled(DialogContent)`
  border: 1px solid blue;
  padding: 16px;
  max-height: var(${VISUAL_VIEWPORT_HEIGHT_VAR});
  overflow-y: auto;
`
