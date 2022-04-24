import { forwardRef } from 'react'
import styled from 'styled-components'
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogContentProps,
} from './dialog'
import { ModalProps } from './popout'
import { VISUAL_VIEWPORT_HEIGHT_VAR } from '../hooks/viewport-size'

export const Dialog = forwardRef(
  ({ content, children, ...props }: ModalProps, ref: any) => {
    return (
      <BaseDialog overlay {...props}>
        <ModalContent {...content}>{children}</ModalContent>
      </BaseDialog>
    )
  },
)

export interface ModalContentProps extends DialogContentProps {}

const ModalContent = styled(DialogContent)`
  border: 1px solid blue;
  max-height: calc(var(${VISUAL_VIEWPORT_HEIGHT_VAR}) * 0.9);
  max-width: 90vw;
  width: 800px;
  overflow-y: auto;
`

export const Header = styled.div`
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  background: lightgrey;
`

export const Body = styled.div`
  padding: 0.5rem;
`

export const Title = styled.div`
  font-size: 1.5rem;
`
