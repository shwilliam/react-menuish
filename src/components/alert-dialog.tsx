import { Modal } from './modal'
import { ModalProps } from './popout'

interface AlertDialogProps extends ModalProps {
  content: Omit<ModalProps['content'], 'aria-describedby'> & {
    'aria-describedby': string
  }
}

export const AlertDialog = ({ content, ...props }: AlertDialogProps) => (
  <Modal
    {...props}
    content={{
      ...content,
      closeOnInteractOutside: false,
      role: 'alertdialog',
    }}
  />
)
