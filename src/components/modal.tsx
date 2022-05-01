import { forwardRef } from 'react'
import styled from 'styled-components'
import { useTransition } from 'react-spring'
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogContentProps,
} from './dialog'
import { ModalProps } from './popout'
import { VISUAL_VIEWPORT_HEIGHT_VAR } from '../hooks/viewport-size'

export const Dialog = forwardRef(
  ({ isOpen, content, children, ...props }: ModalProps, ref: any) => {
    const transitions = useTransition(isOpen, {
      from: { opacity: 0, y: -10 },
      enter: { opacity: 1, y: 0 },
      leave: { opacity: 0, y: 10 },
    })

    return transitions((styles, item) => (
      <BaseDialog isOpen={!!item} overlay {...props}>
        <ModalContent
          ref={ref}
          style={{
            opacity: styles.opacity,
            transform: styles.y.to(
              (value) => `translate3d(0px, ${value}px, 0px)`,
            ),
          }}
          {...content}
        >
          {children}
        </ModalContent>
      </BaseDialog>
    ))
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
