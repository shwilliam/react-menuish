import { ForwardedRef, forwardRef } from 'react'
import styled from 'styled-components'
import { useTransition } from 'react-spring'
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogContentProps,
  useDialogContext,
} from './dialog'
import { VISUAL_VIEWPORT_HEIGHT_VAR } from '../hooks/viewport-size'

interface ModalProps extends ModalContentProps {}

export const Dialog = forwardRef(
  (props: ModalProps, ref: ForwardedRef<any>) => {
    const dialogCtxt = useDialogContext()
    const transitions = useTransition(dialogCtxt.isOpen, {
      from: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0 },
      leave: { opacity: 0, y: -10 },
    })

    return transitions((styles, item) => (
      <BaseDialog isOpen={!!item}>
        <ModalContent
          ref={ref}
          {...props}
          style={{
            opacity: styles.opacity,
            transform: styles.y.to(
              (value) => `translate3d(0px, ${value}px, 0px)`,
            ),
            ...(props.style || {}),
          }}
        />
      </BaseDialog>
    ))
  },
)

interface ModalContentProps extends DialogContentProps {}

const ModalContent = styled(DialogContent)<ModalContentProps>`
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
