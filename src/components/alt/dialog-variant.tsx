import { ForwardedRef, forwardRef } from 'react'
import { useIsMobile } from '../../hooks/is-mobile'
import { Modal } from './modal'
import { DialogVariantProps, Popout } from './popout'
import { Tray } from './tray'

export const DialogVariant = forwardRef(
  (
    { type, mobileType, ...props }: DialogVariantProps,
    ref: ForwardedRef<any>,
  ) => {
    const isMobile = useIsMobile()

    if (type === 'modal' || (isMobile && mobileType === 'modal'))
      return <Modal ref={ref} {...props} />
    if (type === 'tray' || (isMobile && mobileType === 'tray'))
      return <Tray ref={ref} {...props} />
    return <Popout {...props} />
  },
)
