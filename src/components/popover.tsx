import { useRef, useState } from 'react'
import { Modal, ModalContent } from './modal'
import { Popout, PopoutContent } from './popout'
import { Tray } from './tray'
import { useIsMobile } from '../hooks/is-mobile'
import { mergeRefs } from '../util/merge-refs'

// FIXME: type
export const Popover = ({
  mobileVariant = 'modal',
  trigger,
  children,
  ...props
}: any) => {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<any>()
  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  const triggerProps = {
    ref: triggerRef,
    open: handleOpen,
  }

  if (isMobile) {
    if (mobileVariant === 'tray')
      return (
        <>
          {trigger(triggerProps)}
          <Tray isOpen={isOpen} onClose={handleClose}>
            {children}
          </Tray>
        </>
      )
    else
      return (
        <>
          {trigger(triggerProps)}
          <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>{children}</ModalContent>
          </Modal>
        </>
      )
  }

  return (
    <Popout
      trigger={({ anchorRef }) =>
        trigger({
          ...triggerProps,
          ref: mergeRefs(anchorRef, triggerProps.ref),
        })
      }
      isOpen={isOpen}
      onClose={handleClose}
      {...props}
    >
      <PopoutContent>{children}</PopoutContent>
    </Popout>
  )
}
