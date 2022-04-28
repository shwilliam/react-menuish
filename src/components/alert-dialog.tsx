import { ModalDialog, ModalProps } from './dialog-variant'

interface AlertDialogProps extends ModalProps {
  'aria-describedby': string
}

export const AlertDialog = (props: AlertDialogProps) => (
  <ModalDialog closeOnInteractOutside={false} role="alertdialog" {...props} />
)
