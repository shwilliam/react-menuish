import {
  DialogVariantType,
  ModalVariant,
  ModalVariantProps,
} from './dialog-variant'

interface AlertDialogProps<M extends DialogVariantType | undefined>
  extends ModalVariantProps<M> {
  'aria-describedby': string
}

export const AlertDialog = <M extends DialogVariantType | undefined>(
  props: AlertDialogProps<M>,
) => (
  <ModalVariant
    {...props}
    dialog={{ closeOnInteractOutside: false, ...(props.dialog || {}) }}
    role="alertdialog"
  />
)
