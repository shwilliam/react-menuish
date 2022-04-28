import { Placement } from '@floating-ui/react-dom'
import { forwardRef, MutableRefObject, ReactNode } from 'react'
import { useIsMobile } from '../hooks/is-mobile'
import { PopoverPosition } from '../hooks/popover-position'
import { DialogContainer, DialogTrigger } from './dialog'
import { ModalBase, ModalBaseProps } from './modal'
import { PopoutBase, PopoutBaseProps } from './popout'
import { TrayBase, TrayBaseProps } from './tray'

type VariantType = 'popout' | 'modal' | 'tray'

type DialogVariantOptions<T extends VariantType> = {
  modal: ModalBaseProps
  tray: TrayBaseProps
  popout: PopoutBaseProps
}[T]

interface DialogVariantTriggerProps {
  ref: MutableRefObject<any>
  open: () => void
  close: () => void
}

export interface DialogVariantBaseProps {
  trigger?: (props: DialogVariantTriggerProps) => ReactNode
  placement?: Placement
  position?: PopoverPosition
  dialogId?: string
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  overlay?: boolean
  allowPinchZoom?: boolean
  isScrollDisabled?: boolean
  isFocusTakeoverDisabled?: boolean
  noFocusLock?: boolean
  isolateDialog?: boolean
  closeOnInteractOutside?: boolean
  initialFocusRef?: any
  children: ReactNode
}

export type DialogVariantProps<T extends VariantType> =
  DialogVariantOptions<T> &
    Omit<DialogVariantBaseProps, 'children'> & {
      variant: T
      mobileVariant?: VariantType
    }

// FIXME:
export type GetDialogVariantProps<T extends VariantType> = DialogVariantProps<T>

const variantTypeComponents = {
  tray: TrayBase,
  popout: PopoutBase,
  modal: ModalBase,
}

export const DialogVariant = forwardRef(
  <T extends VariantType>(
    {
      variant,
      mobileVariant,
      trigger,
      children,
      ...props
    }: DialogVariantProps<T>,
    ref,
  ) => {
    const isMobile = useIsMobile()
    const Comp = variantTypeComponents[(isMobile && mobileVariant) || variant]
    const dialogVariant = (
      <Comp ref={ref} {...props}>
        {children}
      </Comp>
    )

    if (trigger)
      return (
        <DialogTrigger trigger={trigger} {...props}>
          {dialogVariant}
        </DialogTrigger>
      )
    return <DialogContainer {...props}>{dialogVariant}</DialogContainer>
  },
)

export interface PopoutProps
  extends Omit<DialogVariantProps<'popout'>, 'variant'> {}
export const Popout = forwardRef((props: PopoutProps, ref) => (
  <DialogVariant
    ref={ref}
    variant="popout"
    isScrollDisabled={false}
    {...props}
  />
))

export interface TrayProps
  extends Omit<DialogVariantProps<'tray'>, 'variant'> {}
export const Tray = forwardRef(({ children, ...props }: TrayProps, ref) => (
  <DialogVariant ref={ref} variant="tray" overlay {...props}>
    {children}
  </DialogVariant>
))

export interface ModalProps
  extends Omit<DialogVariantProps<'modal'>, 'variant'> {}
export const ModalDialog = forwardRef(
  ({ children, ...props }: ModalProps, ref) => (
    <DialogVariant ref={ref} variant="modal" overlay {...props}>
      {children}
    </DialogVariant>
  ),
)
